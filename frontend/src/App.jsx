import React, { useEffect, useState } from 'react'

const API = 'http://localhost:8000/tasks'

export default function App() {
  const [tasks, setTasks] = useState([])
  const [newTitle, setNewTitle] = useState('')

  const load = async () => {
    const res = await fetch(API)
    setTasks(await res.json())
  }

  useEffect(() => {
    load()
  }, [])

  const addTask = async () => {
    if (!newTitle.trim()) return
    const res = await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle, done: false })
    })
    const task = await res.json()
    setTasks([...tasks, task])
    setNewTitle('')
  }

  const updateTask = async (id, data) => {
    const res = await fetch(`${API}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    const updated = await res.json()
    setTasks(tasks.map(t => (t.id === id ? updated : t)))
  }

  const deleteTask = async (id) => {
    await fetch(`${API}/${id}`, { method: 'DELETE' })
    setTasks(tasks.filter(t => t.id !== id))
  }

  return (
    <div>
      <h1>Task Manager Lite</h1>
      <input
        placeholder="New task"
        value={newTitle}
        onChange={e => setNewTitle(e.target.value)}
      />
      <button onClick={addTask}>Add</button>
      <ul>
        {tasks.map(task => (
          <li key={task.id}>
            <input
              type="checkbox"
              checked={task.done}
              onChange={e => updateTask(task.id, { done: e.target.checked })}
            />
            <input
              value={task.title}
              onChange={e => updateTask(task.id, { title: e.target.value })}
            />
            <button onClick={() => deleteTask(task.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  )
}
