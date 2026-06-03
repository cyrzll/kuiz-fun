import { serve, upgradeWebSocket } from '@hono/node-server';
import { WebSocketServer } from 'ws';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { jwt, sign, verify } from 'hono/jwt';
import { initDb, dbRun, dbGet, dbAll } from './db.js';

const app = new Hono();
const JWT_SECRET = 'pancasila-fun-quiz-secret-key-12345';

// Database Initialisation
initDb().then(() => {
  console.log('SQLite database initialized successfully.');
}).catch((err: any) => {
  console.error('Database initialization failed:', err);
});

// Configure CORS middleware
app.use('/api/*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization']
}));

const authMiddleware = jwt({ secret: JWT_SECRET, alg: 'HS256' });

app.get('/', (c) => {
  return c.text('Pancasila Fun Quiz Backend Server is running.');
});

// 1. Get all modules structure from database
app.get('/api/modules', async (c) => {
  try {
    const modules = await dbAll('SELECT * FROM modules');
    const response: Record<string, any> = {};

    for (const m of modules) {
      const materials = await dbAll('SELECT title, content, icon FROM materials WHERE module_id = ? ORDER BY sort_order ASC', [m.id]);
      const questions = await dbAll('SELECT id, question, explanation FROM questions WHERE module_id = ? ORDER BY sort_order ASC', [m.id]);

      const questionsWithOptions = [];
      for (const q of questions) {
        const options = await dbAll('SELECT key, text, is_correct FROM options WHERE question_id = ? ORDER BY key ASC', [q.id]);
        questionsWithOptions.push({
          id: q.id,
          question: q.question,
          explanation: q.explanation,
          options: options.map((opt: any) => ({
            key: opt.key,
            text: opt.text,
            isCorrect: opt.is_correct === 1
          }))
        });
      }

      response[m.id] = {
        id: m.id,
        title: m.title,
        description: m.description,
        materials,
        questions: questionsWithOptions
      };
    }

    return c.json(response);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// 2. Verify Room Existence
app.get('/api/rooms/:code', async (c) => {
  const code = c.req.param('code');
  try {
    const room = await dbGet('SELECT * FROM rooms WHERE room_code = ?', [code]);
    if (!room) {
      return c.json({ error: 'Room not found' }, 404);
    }
    return c.json({
      roomCode: room.room_code,
      quizTitle: room.quiz_title,
      modulId: room.modul_id,
      mentorName: room.mentor_name,
      schoolName: room.school_name,
      status: room.status
    });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// 3. Create active Room (Mentor/Teacher)
app.post('/api/rooms', async (c) => {
  try {
    const { quizTitle, modulId, mentorName, schoolName } = await c.req.json();
    if (!quizTitle || !modulId || !mentorName || !schoolName) {
      return c.json({ error: 'All fields are required' }, 400);
    }

    let roomCode = '';
    while (true) {
      roomCode = String(Math.floor(100000 + Math.random() * 900000));
      const existing = await dbGet('SELECT 1 FROM rooms WHERE room_code = ?', [roomCode]);
      if (!existing) break;
    }

    await dbRun(
      'INSERT INTO rooms (room_code, quiz_title, modul_id, mentor_name, school_name) VALUES (?, ?, ?, ?, ?)',
      [roomCode, quizTitle, modulId, mentorName, schoolName]
    );

    return c.json({
      roomCode,
      quizTitle,
      modulId,
      mentorName,
      schoolName,
      status: 'lobby'
    });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// 4. Student Join Room -> Issues JWT Access Token
app.post('/api/rooms/join', async (c) => {
  try {
    const { roomCode, name } = await c.req.json();
    if (!roomCode || !name) {
      return c.json({ error: 'Room code and student name are required' }, 400);
    }

    const room = await dbGet('SELECT * FROM rooms WHERE room_code = ?', [roomCode]);
    if (!room) {
      return c.json({ error: 'Room not found' }, 404);
    }

    let student = await dbGet('SELECT * FROM students WHERE room_code = ? AND name = ?', [roomCode, name]);
    if (!student) {
      const result = await dbRun(
        'INSERT INTO students (room_code, name) VALUES (?, ?)',
        [roomCode, name]
      );
      student = await dbGet('SELECT * FROM students WHERE id = ?', [result.lastID]);
    }

    if (!student) {
      return c.json({ error: 'Failed to create/retrieve student session' }, 500);
    }

    const token = await sign({
      studentId: student.id,
      roomCode: student.room_code,
      name: student.name,
      exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60
    }, JWT_SECRET);

    return c.json({
      token,
      student: {
        id: student.id,
        name: student.name,
        roomCode: student.room_code,
        score: student.score,
        step: student.step,
        currentQuestionIdx: student.current_question_idx
      }
    });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// 5. Get Student Profile & Slide Progress (JWT Protected)
app.get('/api/me', authMiddleware, async (c) => {
  const payload = c.get('jwtPayload') as any;
  try {
    const student = await dbGet('SELECT * FROM students WHERE id = ?', [payload.studentId]);
    if (!student) {
      return c.json({ error: 'Student session not found' }, 404);
    }

    const progressRows = await dbAll('SELECT slide_key FROM student_progress WHERE student_id = ?', [student.id]);
    const progress = progressRows.map((row: any) => row.slide_key);

    return c.json({
      id: student.id,
      name: student.name,
      roomCode: student.room_code,
      score: student.score,
      step: student.step,
      currentQuestionIdx: student.current_question_idx,
      selectedModulId: student.selected_modul_id,
      materialIdx: student.material_idx,
      isFinished: student.is_finished === 1,
      progress
    });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// 6. Get Active Students in Room (Lobby/Monitor)
app.get('/api/rooms/:code/students', async (c) => {
  const code = c.req.param('code');
  try {
    const students = await dbAll('SELECT name, score, is_finished FROM students WHERE room_code = ?', [code]);
    return c.json(students);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// ==========================================
// WebSocket live synchronization engine
// ==========================================

const activeRoomConnections = new Map<string, Map<string | number, any>>();

async function sendMonitorUpdateToTeacher(roomCode: string, ws: any) {
  try {
    const students = await dbAll('SELECT id, name, score, current_question_idx, step, is_finished FROM students WHERE room_code = ?', [roomCode]);
    const totalMaterialsResult = await dbGet<{ count: number }>('SELECT COUNT(*) as count FROM materials');
    const totalMaterials = totalMaterialsResult?.count || 1;

    const monitorData = [];
    for (const s of students) {
      const progressCountResult = await dbGet<{ count: number }>('SELECT COUNT(*) as count FROM student_progress WHERE student_id = ?', [s.id]);
      const progressCount = progressCountResult?.count || 0;
      const progressPercent = Math.round((progressCount / totalMaterials) * 100);

      monitorData.push({
        name: s.name,
        score: s.score,
        step: s.step,
        currentQuestionIdx: s.current_question_idx,
        progressPercent,
        isFinished: s.is_finished === 1
      });
    }

    ws.send(JSON.stringify({
      type: 'MONITOR_UPDATE',
      data: monitorData
    }));
  } catch (err) {
    console.error('Error sending monitor update:', err);
  }
}

async function broadcastToTeacher(roomCode: string) {
  const roomMap = activeRoomConnections.get(roomCode);
  if (!roomMap) return;
  const teacherSocket = roomMap.get('teacher');
  if (teacherSocket && teacherSocket.readyState === 1) {
    sendMonitorUpdateToTeacher(roomCode, teacherSocket);
  }
}

function broadcastToStudents(roomCode: string, payload: any) {
  const roomMap = activeRoomConnections.get(roomCode);
  if (!roomMap) return;
  const dataStr = JSON.stringify(payload);
  for (const [key, socket] of roomMap.entries()) {
    if (key !== 'teacher' && socket.readyState === 1) {
      socket.send(dataStr);
    }
  }
}

app.get(
  '/ws',
  upgradeWebSocket(async (c: any) => {
    const url = new URL(c.req.url);
    const token = url.searchParams.get('token');
    const role = url.searchParams.get('role');
    const teacherRoomCode = url.searchParams.get('roomCode');

    let studentId: number | null = null;
    let roomCode = '';
    let studentName = '';

    if (role === 'teacher') {
      if (!teacherRoomCode) {
        return {
          onOpen: (event: any, ws: any) => ws.close(1008, 'Missing roomCode parameter')
        };
      }
      roomCode = teacherRoomCode;
    } else {
      if (!token) {
        return {
          onOpen: (event: any, ws: any) => ws.close(1008, 'Token parameter is required')
        };
      }
      try {
        const decoded = await verify(token, JWT_SECRET, 'HS256') as any;
        studentId = decoded.studentId as number;
        roomCode = decoded.roomCode as string;
        studentName = decoded.name as string;
      } catch (err) {
        return {
          onOpen: (event: any, ws: any) => ws.close(1008, 'Authentication token is invalid')
        };
      }
    }

    return {
      onOpen(event: any, ws: any) {
        if (!activeRoomConnections.has(roomCode)) {
          activeRoomConnections.set(roomCode, new Map());
        }
        const roomMap = activeRoomConnections.get(roomCode)!;
        const key = role === 'teacher' ? 'teacher' : studentId!;
        roomMap.set(key, ws);

        if (role !== 'teacher' && studentId) {
          dbGet('SELECT * FROM students WHERE id = ?', [studentId]).then(async (student: any) => {
            if (student) {
              const progressRows = await dbAll('SELECT slide_key FROM student_progress WHERE student_id = ?', [studentId]);
              const progress = progressRows.map((row: any) => row.slide_key);

              let timeLeft = 15;
              if (student.step === 'quiz' && student.question_start_time) {
                const elapsed = (Date.now() - student.question_start_time) / 1000;
                timeLeft = Math.max(0, Math.floor(15 - elapsed));
              }

              ws.send(JSON.stringify({
                type: 'RESUME_STATE',
                data: {
                  score: student.score,
                  step: student.step,
                  currentQuestionIdx: student.current_question_idx,
                  timeLeft,
                  progress,
                  selectedModulId: student.selected_modul_id,
                  materialIdx: student.material_idx
                }
              }));

              broadcastToTeacher(roomCode);
            }
          });
        } else {
          sendMonitorUpdateToTeacher(roomCode, ws);
        }
      },
      onMessage(event: any, ws: any) {
        try {
          const msg = JSON.parse(event.data.toString());

          if (role === 'teacher') {
            if (msg.type === 'START_GAME') {
              dbRun('UPDATE rooms SET status = "active" WHERE room_code = ?', [roomCode]).then(() => {
                broadcastToStudents(roomCode, { type: 'GAME_STARTED' });
              });
            } else if (msg.type === 'CANCEL_GAME') {
              dbRun('DELETE FROM student_progress WHERE student_id IN (SELECT id FROM students WHERE room_code = ?)', [roomCode]).then(() => {
                dbRun('DELETE FROM students WHERE room_code = ?', [roomCode]).then(() => {
                  dbRun('DELETE FROM rooms WHERE room_code = ?', [roomCode]).then(() => {
                    broadcastToStudents(roomCode, { type: 'ROOM_CANCELLED' });
                    const roomMap = activeRoomConnections.get(roomCode);
                    if (roomMap) {
                      for (const [key, ws] of roomMap.entries()) {
                        if (key !== 'teacher') {
                          ws.close(1000, 'Room cancelled by teacher');
                        }
                      }
                    }
                  });
                });
              });
            }
            return;
          }

          if (!studentId) return;

          switch (msg.type) {
            case 'UPDATE_PROGRESS': {
              const { slideKey, selectedModulId, materialIdx, step } = msg;
              dbRun('INSERT OR IGNORE INTO student_progress (student_id, slide_key) VALUES (?, ?)', [studentId, slideKey]).then(() => {
                dbRun(
                  'UPDATE students SET selected_modul_id = ?, material_idx = ?, step = ? WHERE id = ?',
                  [selectedModulId, materialIdx, step, studentId]
                ).then(() => {
                  broadcastToTeacher(roomCode);
                });
              });
              break;
            }
            case 'SELECT_MODULE': {
              const { selectedModulId, step, materialIdx } = msg;
              dbRun(
                'UPDATE students SET selected_modul_id = ?, step = ?, material_idx = ? WHERE id = ?',
                [selectedModulId, step, materialIdx, studentId]
              ).then(() => {
                broadcastToTeacher(roomCode);
              });
              break;
            }
            case 'START_QUIZ': {
              dbRun(
                'UPDATE students SET step = "quiz", current_question_idx = 0, score = 0, question_start_time = ? WHERE id = ?',
                [Date.now(), studentId]
              ).then(() => {
                ws.send(JSON.stringify({
                  type: 'QUIZ_QUESTION',
                  data: {
                    questionIdx: 0,
                    timeLeft: 15
                  }
                }));
                broadcastToTeacher(roomCode);
              });
              break;
            }
            case 'SUBMIT_ANSWER': {
              const { optionKey } = msg;
              dbGet('SELECT * FROM students WHERE id = ?', [studentId]).then(async (student: any) => {
                if (!student) return;

                const modules = await dbAll('SELECT id FROM modules');
                const allQuestions: any[] = [];
                for (const m of modules) {
                  const qs = await dbAll('SELECT q.id, q.explanation, o.key, o.is_correct FROM questions q JOIN options o ON q.id = o.question_id WHERE q.module_id = ? ORDER BY q.sort_order ASC', [m.id]);
                  const grouped: Record<number, any> = {};
                  for (const row of qs as any[]) {
                    if (!grouped[row.id]) {
                      grouped[row.id] = { id: row.id, explanation: row.explanation, options: [] };
                    }
                    grouped[row.id].options.push({ key: row.key, isCorrect: row.is_correct === 1 });
                  }
                  allQuestions.push(...Object.values(grouped));
                }

                const currentQuestion = allQuestions[student.current_question_idx];
                if (!currentQuestion) {
                  ws.send(JSON.stringify({ type: 'ERROR', message: 'Question not found' }));
                  return;
                }

                const correctOption = currentQuestion.options.find((o: any) => o.isCorrect);
                const isCorrect = optionKey === correctOption?.key;
                
                const now = Date.now();
                const elapsed = (now - student.question_start_time) / 1000;
                let scoreEarned = 0;

                if (isCorrect && elapsed <= 16.5) {
                  const remaining = Math.max(0, 15 - elapsed);
                  scoreEarned = 100 + Math.round(remaining * 5);
                }

                const newScore = student.score + scoreEarned;
                const nextQuestionIdx = student.current_question_idx + 1;
                const isQuizFinished = nextQuestionIdx >= allQuestions.length;
                const nextStep = isQuizFinished ? 'finished' : 'quiz';

                dbRun(
                  'UPDATE students SET score = ?, current_question_idx = ?, step = ?, is_finished = ? WHERE id = ?',
                  [newScore, nextQuestionIdx, nextStep, isQuizFinished ? 1 : 0, studentId]
                ).then(() => {
                  ws.send(JSON.stringify({
                    type: 'ANSWER_RESULT',
                    data: {
                      isCorrect,
                      correctKey: correctOption?.key || 'B',
                      scoreEarned,
                      score: newScore,
                      explanation: currentQuestion.explanation,
                      nextQuestionIdx
                    }
                  }));
                  broadcastToTeacher(roomCode);
                });
              });
              break;
            }
            case 'GET_NEXT_QUESTION': {
              dbRun('UPDATE students SET question_start_time = ? WHERE id = ?', [Date.now(), studentId]).then(() => {
                dbGet('SELECT current_question_idx FROM students WHERE id = ?', [studentId]).then((student: any) => {
                  ws.send(JSON.stringify({
                    type: 'QUIZ_QUESTION',
                    data: {
                      questionIdx: student?.current_question_idx || 0,
                      timeLeft: 15
                    }
                  }));
                });
              });
              break;
            }
            case 'FINISH_QUIZ': {
              dbRun('UPDATE students SET step = "finished", is_finished = 1 WHERE id = ?', [studentId]).then(() => {
                broadcastToTeacher(roomCode);
              });
              break;
            }
          }
        } catch (err) {
          console.error('Error handling socket message:', err);
        }
      },
      onClose(event: any, ws: any) {
        console.log(`WS Connection closed. Room: ${roomCode}, StudentId: ${studentId || 'teacher'}`);
        const roomMap = activeRoomConnections.get(roomCode);
        if (roomMap) {
          const key = role === 'teacher' ? 'teacher' : studentId!;
          roomMap.delete(key);
          if (roomMap.size === 0) {
            activeRoomConnections.delete(roomCode);
          }
        }
      }
    };
  })
);

// Create WebSocket server and bind it to Hono Node server
const wss = new WebSocketServer({ noServer: true });

const server = serve({
  fetch: app.fetch,
  port: 3000,
  websocket: {
    server: wss
  }
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`);
});

// database reseeded with new module

