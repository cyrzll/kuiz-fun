import { Hono } from 'hono';
import { sign } from 'hono/jwt';
import { dbGet, dbRun, dbAll } from '../db.js';
import { JWT_SECRET } from '../config.js';

const router = new Hono();

// Get All Rooms History (Sessions)
router.get('/', async (c) => {
  try {
    const rooms = await dbAll('SELECT * FROM rooms ORDER BY created_at DESC');
    const response = [];
    for (const r of rooms) {
      const students = await dbAll('SELECT name, score, is_finished, avatar FROM students WHERE room_code = ? ORDER BY score DESC, name ASC', [r.room_code]);
      response.push({
        roomCode: r.room_code,
        quizTitle: r.quiz_title,
        modulId: r.modul_id,
        mentorName: r.mentor_name,
        schoolName: r.school_name,
        status: r.status,
        createdAt: r.created_at,
        students: students
      });
    }
    return c.json(response);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// Verify Room Existence
router.get('/:code', async (c) => {
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

// Create active Room (Mentor/Teacher)
router.post('/', async (c) => {
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

// Student Join Room -> Issues JWT Access Token
router.post('/join', async (c) => {
  try {
    const { roomCode, name, avatar } = await c.req.json();
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
        'INSERT INTO students (room_code, name, avatar) VALUES (?, ?, ?)',
        [roomCode, name, avatar || 'profil-1.webp']
      );
      student = await dbGet('SELECT * FROM students WHERE id = ?', [result.lastID]);
    } else if (avatar && student.avatar !== avatar) {
      await dbRun('UPDATE students SET avatar = ? WHERE id = ?', [avatar, student.id]);
      student.avatar = avatar;
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
        avatar: student.avatar,
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

// Get Active Students in Room (Lobby/Monitor)
router.get('/:code/students', async (c) => {
  const code = c.req.param('code');
  try {
    const students = await dbAll('SELECT name, score, is_finished, avatar FROM students WHERE room_code = ?', [code]);
    return c.json(students);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// Delete a Room Session (and all associated student data)
router.delete('/:code', async (c) => {
  const code = c.req.param('code');
  try {
    const existing = await dbGet('SELECT 1 FROM rooms WHERE room_code = ?', [code]);
    if (!existing) {
      return c.json({ error: 'Sesi room tidak ditemukan' }, 404);
    }

    // 1. Delete student progress for all students in the room
    await dbRun(`
      DELETE FROM student_progress 
      WHERE student_id IN (SELECT id FROM students WHERE room_code = ?)
    `, [code]);

    // 2. Delete students associated with this room code
    await dbRun('DELETE FROM students WHERE room_code = ?', [code]);

    // 3. Delete room session
    await dbRun('DELETE FROM rooms WHERE room_code = ?', [code]);

    return c.json({ success: true, message: 'Sesi kuis berhasil dihapus' });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

export default router;
