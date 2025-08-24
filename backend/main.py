from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List

app = FastAPI()

class Task(BaseModel):
    id: int
    title: str
    done: bool = False

class TaskCreate(BaseModel):
    title: str
    done: bool = False

class TaskUpdate(BaseModel):
    title: str | None = None
    done: bool | None = None

_tasks: List[Task] = []
_next_id = 1

@app.get("/tasks", response_model=List[Task])
def list_tasks():
    return _tasks

@app.post("/tasks", response_model=Task, status_code=201)
def create_task(task: TaskCreate):
    global _next_id
    new = Task(id=_next_id, **task.dict())
    _next_id += 1
    _tasks.append(new)
    return new

@app.put("/tasks/{task_id}", response_model=Task)
def update_task(task_id: int, update: TaskUpdate):
    for t in _tasks:
        if t.id == task_id:
            data = update.dict(exclude_unset=True)
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
