const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'tasks.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Failed to open SQLite database', err);
    throw err;
  }
});

const run = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve(this);
    });
  });

const get = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });

const all = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });

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
  return { id: result.lastID, title, done: false };
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
