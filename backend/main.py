from collections import Counter
from datetime import date
from fastapi import FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, field_validator
from typing import List
from fastapi.staticfiles import StaticFiles
app.mount("/", StaticFiles(directory="frontend/dist", html=True), name="static")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Task(BaseModel):
    id: int
    title: str
    description: str | None = ""
    due_date: date | None = None
    priority: str = "normal"
    done: bool = False

class TaskCreate(BaseModel):
    title: str
    description: str | None = ""
    due_date: date | None = None
    priority: str = "normal"
    done: bool = False

    @field_validator("due_date")
    @classmethod
    def check_due_date(cls, v: date | None) -> date | None:
        if v is not None and v < date.today():
            raise ValueError("due_date cannot be in the past")
        return v

class TaskUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    due_date: date | None = None
    priority: str | None = None
    done: bool | None = None

    @field_validator("due_date")
    @classmethod
    def check_due_date(cls, v: date | None) -> date | None:
        if v is not None and v < date.today():
            raise ValueError("due_date cannot be in the past")
        return v

_tasks: List[Task] = []
_next_id = 1

@app.options("/tasks")
@app.options("/tasks/{task_id}")
def _cors_preflight_handler(task_id: int | None = None) -> Response:  # pragma: no cover
    """Explicitly handle CORS preflight requests."""
    return Response(status_code=200)

@app.get("/tasks", response_model=List[Task])
def list_tasks():
    return _tasks

@app.post("/tasks", response_model=Task, status_code=201)
def create_task(task: TaskCreate):
    global _next_id
    new = Task(id=_next_id, **task.model_dump())
    _next_id += 1
    _tasks.append(new)
    return new

@app.put("/tasks/{task_id}", response_model=Task)
def update_task(task_id: int, update: TaskUpdate):
    for t in _tasks:
        if t.id == task_id:
            data = update.model_dump(exclude_unset=True)
            for key, value in data.items():
                setattr(t, key, value)
            return t
    raise HTTPException(status_code=404, detail="Task not found")

@app.delete("/tasks/{task_id}", status_code=204)
def delete_task(task_id: int):
    for i, t in enumerate(_tasks):
        if t.id == task_id:
            _tasks.pop(i)
            return
    raise HTTPException(status_code=404, detail="Task not found")

@app.get("/summary")
def task_summary():
    total = len(_tasks)
    completed = sum(1 for t in _tasks if t.done)
    pending = total - completed
    priorities = Counter(t.priority for t in _tasks)
    return {
        "total": total,
        "completed": completed,
        "pending": pending,
        "by_priority": dict(priorities),
    }

@app.get("/export", response_class=Response)
def export_tasks():
    header = "id,title,description,due_date,priority,done\n"
    rows = [
        f"{t.id},{t.title},{t.description or ''},"
        f"{t.due_date.isoformat() if t.due_date else ''},"
        f"{t.priority},{t.done}"
        for t in _tasks
    ]
    csv = header + "\n".join(rows)
    return Response(content=csv, media_type="text/csv")
