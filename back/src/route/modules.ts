import { Hono } from 'hono';
import { dbAll, dbRun, dbGet } from '../db.js';

const router = new Hono();

router.get('/', async (c) => {
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

router.post('/', async (c) => {
  try {
    const { title, description, materials, questions } = await c.req.json();
    if (!title) {
      return c.json({ error: 'Title is required' }, 400);
    }

    // Generate a unique module ID
    const moduleId = 'modul_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);

    // Insert module
    await dbRun('INSERT INTO modules (id, title, description) VALUES (?, ?, ?)', [
      moduleId,
      title,
      description || ''
    ]);

    // Insert materials
    if (Array.isArray(materials)) {
      for (let i = 0; i < materials.length; i++) {
        const mat = materials[i];
        await dbRun(
          'INSERT INTO materials (module_id, title, content, icon, sort_order) VALUES (?, ?, ?, ?, ?)',
          [moduleId, mat.title || '', mat.content || '', mat.icon || '📖', i]
        );
      }
    }

    // Insert questions and options
    if (Array.isArray(questions)) {
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        const questionResult = await dbRun(
          'INSERT INTO questions (module_id, question, explanation, sort_order) VALUES (?, ?, ?, ?)',
          [moduleId, q.question || '', q.explanation || '', i]
        );
        const questionId = questionResult.lastID;

        if (Array.isArray(q.options)) {
          for (const opt of q.options) {
            await dbRun(
              'INSERT INTO options (question_id, key, text, is_correct) VALUES (?, ?, ?, ?)',
              [questionId, opt.key || '', opt.text || '', opt.isCorrect ? 1 : 0]
            );
          }
        }
      }
    }

    return c.json({
      success: true,
      moduleId,
      title
    });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

router.get('/:id', async (c) => {
  const id = c.req.param('id');
  try {
    const m = await dbGet('SELECT * FROM modules WHERE id = ?', [id]);
    if (!m) {
      return c.json({ error: 'Kuis tidak ditemukan' }, 404);
    }
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

    return c.json({
      id: m.id,
      title: m.title,
      description: m.description,
      materials,
      questions: questionsWithOptions
    });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

router.put('/:id', async (c) => {
  const id = c.req.param('id');
  try {
    const { title, description, materials, questions } = await c.req.json();
    if (!title) {
      return c.json({ error: 'Title is required' }, 400);
    }

    const existing = await dbGet('SELECT 1 FROM modules WHERE id = ?', [id]);
    if (!existing) {
      return c.json({ error: 'Kuis tidak ditemukan' }, 404);
    }

    // Update module title and description
    await dbRun('UPDATE modules SET title = ?, description = ? WHERE id = ?', [title, description || '', id]);

    // Clear old materials
    await dbRun('DELETE FROM materials WHERE module_id = ?', [id]);

    // Clear old questions & options
    const oldQuestions = await dbAll('SELECT id FROM questions WHERE module_id = ?', [id]);
    for (const q of oldQuestions) {
      await dbRun('DELETE FROM options WHERE question_id = ?', [q.id]);
    }
    await dbRun('DELETE FROM questions WHERE module_id = ?', [id]);

    // Insert new materials
    if (Array.isArray(materials)) {
      for (let i = 0; i < materials.length; i++) {
        const mat = materials[i];
        await dbRun(
          'INSERT INTO materials (module_id, title, content, icon, sort_order) VALUES (?, ?, ?, ?, ?)',
          [id, mat.title || '', mat.content || '', mat.icon || '📖', i]
        );
      }
    }

    // Insert new questions & options
    if (Array.isArray(questions)) {
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        const questionResult = await dbRun(
          'INSERT INTO questions (module_id, question, explanation, sort_order) VALUES (?, ?, ?, ?)',
          [id, q.question || '', q.explanation || '', i]
        );
        const questionId = questionResult.lastID;

        if (Array.isArray(q.options)) {
          for (const opt of q.options) {
            await dbRun(
              'INSERT INTO options (question_id, key, text, is_correct) VALUES (?, ?, ?, ?)',
              [questionId, opt.key || '', opt.text || '', opt.isCorrect ? 1 : 0]
            );
          }
        }
      }
    }

    return c.json({ success: true, moduleId: id, title });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

router.delete('/:id', async (c) => {
  const id = c.req.param('id');
  try {
    const existing = await dbGet('SELECT 1 FROM modules WHERE id = ?', [id]);
    if (!existing) {
      return c.json({ error: 'Kuis tidak ditemukan' }, 404);
    }

    // Delete options associated with the questions
    const questions = await dbAll('SELECT id FROM questions WHERE module_id = ?', [id]);
    for (const q of questions) {
      await dbRun('DELETE FROM options WHERE question_id = ?', [q.id]);
    }

    // Delete questions
    await dbRun('DELETE FROM questions WHERE module_id = ?', [id]);

    // Delete materials
    await dbRun('DELETE FROM materials WHERE module_id = ?', [id]);

    // Delete module
    await dbRun('DELETE FROM modules WHERE id = ?', [id]);

    return c.json({ success: true, message: 'Kuis berhasil dihapus' });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

export default router;
