const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'tasks.db');
const db = new Database(dbPath);

const run = (sql, params = []) => {
  const stmt = db.prepare(sql);
  return Promise.resolve(stmt.run(params));
};

const get = (sql, params = []) => {
  const stmt = db.prepare(sql);
  return Promise.resolve(stmt.get(params));
};

const all = (sql, params = []) => {
  const stmt = db.prepare(sql);
  return Promise.resolve(stmt.all(params));
};

const initializeDatabase = async () => {
  await run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      done INTEGER NOT NULL DEFAULT 0
    )
  `);

  const row = await get('SELECT COUNT(*) AS count FROM tasks');
  if (!row || row.count === 0) {
    const initialTasks = [
      { title: 'Learn Node.js', done: 0 },
      { title: 'Build an API', done: 1 },
      { title: 'Test endpoints', done: 0 },
    ];

    for (const task of initialTasks) {
      await run('INSERT INTO tasks (title, done) VALUES (?, ?)', [task.title, task.done]);
    }
  }
};

const getAllTasks = async () => {
  const rows = await all('SELECT id, title, done FROM tasks ORDER BY id');
  return rows.map((row) => ({ id: row.id, title: row.title, done: Boolean(row.done) }));
};

const getTaskById = async (id) => {
  const row = await get('SELECT id, title, done FROM tasks WHERE id = ?', [id]);
  return row ? { id: row.id, title: row.title, done: Boolean(row.done) } : null;
};

const createTask = async (title) => {
  const result = await run('INSERT INTO tasks (title, done) VALUES (?, ?)', [title, 0]);
  return { id: result.lastInsertRowid, title, done: false };
};

const updateTask = async (id, title, done) => {
  const result = await run('UPDATE tasks SET title = ?, done = ? WHERE id = ?', [title, done ? 1 : 0, id]);
  if (result.changes === 0) return null;
  return { id, title, done };
};

const deleteTask = async (id) => {
  const result = await run('DELETE FROM tasks WHERE id = ?', [id]);
  return result.changes > 0;
};

module.exports = {
  initializeDatabase,
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
};
