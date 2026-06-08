import sqlite3 from 'sqlite3';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, 'db', 'data.db');
const dbDir = join(__dirname, 'db');

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

export const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Database connected at', dbPath);
  }
});

// Wrap sqlite3 operations in Promises for async/await use in Hono
export function dbRun(sql: string, params: any[] = []): Promise<{ lastID: number; changes: number }> {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

export function dbGet<T = any>(sql: string, params: any[] = []): Promise<T | undefined> {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row as T);
    });
  });
}

export function dbAll<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows as T[]);
    });
  });
}

export async function initDb() {
  await dbRun(`
    CREATE TABLE IF NOT EXISTS rooms (
      room_code TEXT PRIMARY KEY,
      quiz_title TEXT NOT NULL,
      modul_id TEXT NOT NULL,
      mentor_name TEXT NOT NULL,
      school_name TEXT NOT NULL,
      status TEXT DEFAULT 'lobby',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS modules (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL
    )
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS materials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      module_id TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      icon TEXT NOT NULL,
      sort_order INTEGER NOT NULL,
      FOREIGN KEY (module_id) REFERENCES modules(id)
    )
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      module_id TEXT NOT NULL,
      question TEXT NOT NULL,
      explanation TEXT NOT NULL,
      sort_order INTEGER NOT NULL,
      FOREIGN KEY (module_id) REFERENCES modules(id)
    )
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS options (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question_id INTEGER NOT NULL,
      key TEXT NOT NULL,
      text TEXT NOT NULL,
      is_correct INTEGER NOT NULL,
      FOREIGN KEY (question_id) REFERENCES questions(id)
    )
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      room_code TEXT NOT NULL,
      name TEXT NOT NULL,
      avatar TEXT,
      score INTEGER DEFAULT 0,
      current_question_idx INTEGER DEFAULT 0,
      question_start_time INTEGER,
      step TEXT DEFAULT 'select-module',
      selected_modul_id TEXT,
      material_idx INTEGER DEFAULT 0,
      is_finished INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (room_code) REFERENCES rooms(room_code)
    )
  `);

  try {
    const columns = await dbAll("PRAGMA table_info(students)");
    const hasAvatar = columns.some((col: any) => col.name === 'avatar');
    if (!hasAvatar) {
      await dbRun("ALTER TABLE students ADD COLUMN avatar TEXT");
      console.log("Added 'avatar' column to 'students' table.");
    }
  } catch (err) {
    console.error("Error migrating students table:", err);
  }

  await dbRun(`
    CREATE TABLE IF NOT EXISTS student_progress (
      student_id INTEGER NOT NULL,
      slide_key TEXT NOT NULL,
      PRIMARY KEY (student_id, slide_key),
      FOREIGN KEY (student_id) REFERENCES students(id)
    )
  `);

  // Seed default data if database is empty
  const moduleCount = await dbGet<{ count: number }>('SELECT COUNT(*) as count FROM modules');
  if (moduleCount && moduleCount.count === 0) {
    console.log('Database empty. Seeding data from dummyRoom.json and dummyModul.json...');
    
    let dummyModulPath = join(__dirname, 'data', 'dummyModul.json');
    if (!fs.existsSync(dummyModulPath)) {
      dummyModulPath = join(__dirname, '..', 'src', 'data', 'dummyModul.json');
    }
    let dummyRoomPath = join(__dirname, 'data', 'dummyRoom.json');
    if (!fs.existsSync(dummyRoomPath)) {
      dummyRoomPath = join(__dirname, '..', 'src', 'data', 'dummyRoom.json');
    }

    if (fs.existsSync(dummyModulPath)) {
      const modulsData = JSON.parse(fs.readFileSync(dummyModulPath, 'utf8'));
      for (const key of Object.keys(modulsData)) {
        const m = modulsData[key];
        await dbRun('INSERT INTO modules (id, title, description) VALUES (?, ?, ?)', [m.id, m.title, m.description]);

        // Seed materials
        for (let i = 0; i < m.materials.length; i++) {
          const mat = m.materials[i];
          await dbRun(
            'INSERT INTO materials (module_id, title, content, icon, sort_order) VALUES (?, ?, ?, ?, ?)',
            [m.id, mat.title, mat.content, mat.icon, i]
          );
        }

        // Seed questions & options
        for (let i = 0; i < m.questions.length; i++) {
          const q = m.questions[i];
          const result = await dbRun(
            'INSERT INTO questions (module_id, question, explanation, sort_order) VALUES (?, ?, ?, ?)',
            [m.id, q.question, q.explanation, i]
          );
          const questionId = result.lastID;

          for (const opt of q.options) {
            await dbRun(
              'INSERT INTO options (question_id, key, text, is_correct) VALUES (?, ?, ?, ?)',
              [questionId, opt.key, opt.text, opt.isCorrect ? 1 : 0]
            );
          }
        }
      }
    }

    // Seed Rooms
    if (fs.existsSync(dummyRoomPath)) {
      const roomsData = JSON.parse(fs.readFileSync(dummyRoomPath, 'utf8'));
      for (const key of Object.keys(roomsData)) {
        const r = roomsData[key];
        await dbRun(
          'INSERT INTO rooms (room_code, quiz_title, modul_id, mentor_name, school_name) VALUES (?, ?, ?, ?, ?)',
          [r.roomCode, r.quizTitle, r.modulId, r.mentorName, r.schoolName]
        );
      }
    }

    console.log('Seeding completed successfully.');
  }
}
