const express = require('express');
const path = require('path');
const {
  initializeDatabase,
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
} = require('./db');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/tasks', async (req, res) => {
  try {
    const tasks = await getAllTasks();
    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load tasks' });
  }
});

app.get('/tasks/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid task id' });

  try {
    const task = await getTaskById(id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load task' });
  }
});

app.post('/tasks', async (req, res) => {
  const { title } = req.body;
  if (typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({ error: 'Title is required' });
  }

  try {
    const task = await createTask(title.trim());
    res.status(201).json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

app.put('/tasks/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid task id' });

  const { title, done } = req.body;
  if (typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({ error: 'Title is required' });
  }
  if (typeof done !== 'boolean') {
    return res.status(400).json({ error: 'Done must be a boolean' });
  }

  try {
    const task = await updateTask(id, title.trim(), done);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

app.delete('/tasks/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid task id' });

  try {
    const deleted = await deleteTask(id);
    if (!deleted) return res.status(404).json({ error: 'Task not found' });
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

const port = Number(process.env.PORT) || 3000;

const startServer = (currentPort) => {
  const server = app.listen(currentPort, () => {
    console.log(`Server running on http://localhost:${currentPort}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE' && currentPort === port) {
      const fallbackPort = currentPort + 1;
      console.log(`Port ${currentPort} is busy. Trying ${fallbackPort} instead.`);
      startServer(fallbackPort);
    } else {
      throw err;
    }
  });
};

initializeDatabase()
  .then(() => startServer(port))
  .catch((err) => {
    console.error('Failed to initialize database', err);
    process.exit(1);
  });
