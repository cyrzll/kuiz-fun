import { Hono } from 'hono';
import { verify } from 'hono/jwt';
import { upgradeWebSocket } from '@hono/node-server';
import { dbGet, dbRun, dbAll } from '../db.js';
import { JWT_SECRET } from '../config.js';

const router = new Hono();

const activeRoomConnections = new Map<string, Map<string | number, any>>();

async function sendMonitorUpdateToTeacher(roomCode: string, ws: any) {
  try {
    const students = await dbAll('SELECT id, name, score, current_question_idx, step, is_finished, avatar FROM students WHERE room_code = ?', [roomCode]);
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
        isFinished: s.is_finished === 1,
        avatar: s.avatar
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

router.get(
  '/',
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
                  materialIdx: student.material_idx,
                  avatar: student.avatar
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

export default router;
