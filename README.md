# Tasks
Task manager lite app
Clone the repository and create a separate branch named by your name.

Goals

- Implement a minimal Task Manager:
  - Backend endpoints:
    - GET /tasks → list tasks
    - POST /tasks → create task
      {title: str, done: bool}
    - PUT /tasks/{id} → update title/done
    - DELETE /tasks/{id} → delete task
    - POST /signup → create user account
    - POST /login → authenticate user
  - Frontend features:
    - Add new tasks
    - List tasks from backend
    - Mark done/undone, edit title, delete
    - UI updates without page reload
- Write unit tests for your code.

You may refactor structure, add files, and improve the UX. Keep it simple, readable, and well-tested.

Task Manager Lite (FastAPI + React)



Getting Started

Prereqs
- Node 18+ and npm
- Python 3.10+

Backend
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port

# Run tests
cd backend
pytest -q

Frontend
cd frontend
npm install
npm run dev  # Vite dev server

# Run tests
cd frontend
npm test
