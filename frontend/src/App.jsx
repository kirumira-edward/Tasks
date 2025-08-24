import React, { useEffect, useState } from 'react'
import './App.css'

const API = 'http://localhost:8000/tasks'

export default function App() {
  const [tasks, setTasks] = useState([])
  const [newTitle, setNewTitle] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newDue, setNewDue] = useState('')
  const [newPriority, setNewPriority] = useState('normal')
  const today = new Date().toISOString().split('T')[0]

  const load = async () => {
    const res = await fetch(API)
    setTasks(await res.json())
  }
  useEffect(() => { load() }, [])

  const notify = msg => alert(msg)

  const addTask = async () => {
    if (!newTitle.trim()) return
    const res = await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: newTitle,
        description: newDesc,
        due_date: newDue || null,
        priority: newPriority,
        done: false,
      }),
    })
    if (!res.ok) return
    const task = await res.json()
    setTasks(prev => [...prev, task])
    notify(`Task added: ${task.title}`)
    setNewTitle('')
    setNewDesc('')
    setNewDue('')
    setNewPriority('normal')
  }

  const handleFieldChange = (id, field, value) => {
    setTasks(prev =>
      prev.map(t => (t.id === id ? { ...t, [field]: value } : t))
    )
  }

  const updateTask = async task => {
    const res = await fetch(`${API}/${task.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task),
    })
    if (!res.ok) return
    const updated = await res.json()
    setTasks(prev => prev.map(t => (t.id === task.id ? updated : t)))
    notify(`Task updated: ${updated.title}`)
  }

  const deleteTask = async id => {
    const task = tasks.find(t => t.id === id)
    const res = await fetch(`${API}/${id}`, { method: 'DELETE' })
    if (!res.ok) return
    setTasks(prev => prev.filter(t => t.id !== id))
    if (task) notify(`Task deleted: ${task.title}`)
  }

  const exportCSV = () => {
    const header = 'id,title,description,due_date,priority,done\n'
    const rows = tasks.map(
      t =>
        `${t.id},${t.title},${t.description ?? ''},${t.due_date ?? ''},${
          t.priority ?? ''
        },${t.done}`,
    )
    const blob = new Blob([header + rows.join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'tasks.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const completedTasks = tasks.filter(t => t.done)
  const pendingTasks = tasks.filter(t => !t.done)
  const total = tasks.length
  const completed = completedTasks.length
  const pending = pendingTasks.length
  const completion = total ? Math.round((completed / total) * 100) : 0

  const renderRows = list =>
    list.map(task => (
      <tr key={task.id} className={`priority-${task.priority}`}>
        <td style={{ textAlign: 'center' }}>
          <input
            type="checkbox"
            checked={task.done}
            onChange={e =>
              handleFieldChange(task.id, 'done', e.target.checked)
            }
          />
        </td>
        <td>
          <input
            value={task.title}
            onChange={e => handleFieldChange(task.id, 'title', e.target.value)}
          />
        </td>
        <td>
          <input
            value={task.description || ''}
            onChange={e =>
              handleFieldChange(task.id, 'description', e.target.value)
            }
          />
        </td>
        <td>
          <input
            type="date"
            min={today}
            value={task.due_date || ''}
            onChange={e =>
              handleFieldChange(task.id, 'due_date', e.target.value || null)
            }
          />
        </td>
        <td>
          <select
            value={task.priority}
            onChange={e =>
              handleFieldChange(task.id, 'priority', e.target.value)
            }
          >
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
          </select>
        </td>
        <td>
          <button onClick={() => updateTask(task)}>Update</button>
        </td>
        <td>
          <button className="delete-btn" onClick={() => deleteTask(task.id)}>
            Delete
          </button>
        </td>
      </tr>
    ))

  return (
    <div className="app">
      <h1>Task Manager Lite</h1>
      <div className="summary">
        <div>
          <strong>Total:</strong> {total} | <strong>Completed:</strong>{' '}
          {completed} | <strong>Pending:</strong> {pending}
          <div className="progress">
            <div
              className="progress-bar"
              style={{ width: `${completion}%` }}
            />
          </div>
        </div>
        <button onClick={exportCSV}>Export CSV</button>
      </div>

      <div className="form">
        <input
          placeholder="Title"
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
        />
        <input
          placeholder="Description"
          value={newDesc}
          onChange={e => setNewDesc(e.target.value)}
        />
        <input
          type="date"
          min={today}
          value={newDue}
          onChange={e => setNewDue(e.target.value)}
        />
        <select
          value={newPriority}
          onChange={e => setNewPriority(e.target.value)}
        >
          <option value="low">Low</option>
          <option value="normal">Normal</option>
          <option value="high">High</option>
        </select>
        <button onClick={addTask}>Add</button>
      </div>

      <h2>Pending Tasks</h2>
      <table className="table">
        <thead>
          <tr>
            <th>Done</th>
            <th>Title</th>
            <th>Description</th>
            <th>Due</th>
            <th>Priority</th>
            <th>Update</th>
            <th />
          </tr>
        </thead>
        <tbody>{renderRows(pendingTasks)}</tbody>
      </table>

      <h2>Completed Tasks</h2>
      <table className="table">
        <thead>
          <tr>
            <th>Done</th>
            <th>Title</th>
            <th>Description</th>
            <th>Due</th>
            <th>Priority</th>
            <th>Update</th>
            <th />
          </tr>
        </thead>
        <tbody>{renderRows(completedTasks)}</tbody>
      </table>
    </div>
  )
}
