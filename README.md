#Task API

## Features
- Simple Express.js CRUD API
- In-memory task storage
- Swagger documentation at /docs

## Installation
npm install

## Run command
npm start

## API endpoint table
| Method | Path | Description |
| --- | --- | --- |
| GET | / | API info |
| GET | /health | Health check |
| GET | /tasks | List tasks |
| GET | /tasks/:id | Get a task |
| POST | /tasks | Create a task |
| PUT | /tasks/:id | Update a task |
| DELETE | /tasks/:id | Delete a task |

## Swagger URL
http://localhost:3000/docs

## Example curl command
curl http://localhost:3000/tasks
