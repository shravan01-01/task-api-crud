const express = require('express');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

let tasks = [
  { id: 1, title: 'Learn Node.js', done: false },
  { id: 2, title: 'Build an API', done: true },
  { id: 3, title: 'Test endpoints', done: false }
];
let nextId = 4;

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/tasks', (req, res) => {
  res.json(tasks);
});

app.get('/tasks/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid task id' });

  const task = tasks.find((item) => item.id === id);
  if (!task) return res.status(404).json({ error: 'Task not found' });

  res.json(task);
});

app.post('/tasks', (req, res) => {
  const { title } = req.body;
  if (typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({ error: 'Title is required' });
  }

  const task = { id: nextId++, title: title.trim(), done: false };
  tasks.push(task);
  res.status(201).json(task);
});

app.put('/tasks/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid task id' });

  const task = tasks.find((item) => item.id === id);
  if (!task) return res.status(404).json({ error: 'Task not found' });

  const { title, done } = req.body;
  if (typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({ error: 'Title is required' });
  }
  if (typeof done !== 'boolean') {
    return res.status(400).json({ error: 'Done must be a boolean' });
  }

  task.title = title.trim();
  task.done = done;
  res.json(task);
});

app.delete('/tasks/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid task id' });

  const index = tasks.findIndex((item) => item.id === id);
  if (index === -1) return res.status(404).json({ error: 'Task not found' });

  tasks.splice(index, 1);
  res.status(204).send();
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

startServer(port);
