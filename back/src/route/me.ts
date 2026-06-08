import { Hono } from 'hono';
import { dbGet, dbAll } from '../db.js';
import { authMiddleware } from '../config.js';

const router = new Hono();

router.get('/', authMiddleware, async (c) => {
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
      avatar: student.avatar,
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

export default router;
