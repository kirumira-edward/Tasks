import React, { useEffect, useState } from 'react'

const API = 'http://localhost:8000/tasks'

export default function App() {
  const [tasks, setTasks] = useState([])
  const [newTitle, setNewTitle] = useState('')

  const [newDesc, setNewDesc] = useState('')
  const [newDue, setNewDue] = useState('')
  const [newPriority, setNewPriority] = useState('normal')

  const total = tasks.length
  const completed = tasks.filter(t => t.done).length
  const pending = total - completed
  const completion = total ? Math.round((completed / total) * 100) : 0


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

      body: JSON.stringify({
        title: newTitle,
        description: newDesc,
        due_date: newDue || null,
        priority: newPriority,
        done: false,
      }),

      body: JSON.stringify({ title: newTitle, done: false })

    })
    const task = await res.json()
    setTasks([...tasks, task])
    setNewTitle('')

    setNewDesc('')
    setNewDue('')
    setNewPriority('normal')

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


  const exportCSV = () => {
    const header = 'id,title,description,due_date,priority,done\n'
    const rows = tasks.map(t => `${t.id},${t.title},${t.description || ''},${t.due_date || ''},${t.priority},${t.done}`)
    const blob = new Blob([header + rows.join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'tasks.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 20 }}>
      <h1>Task Manager Lite</h1>
      <div style={{ marginBottom: 16 }}>
        <strong>Total:</strong> {total} | <strong>Completed:</strong> {completed} | <strong>Pending:</strong> {pending}
        <div style={{ background: '#eee', height: 8, marginTop: 4 }}>
          <div style={{ width: `${completion}%`, background: 'green', height: '100%' }}></div>
        </div>
        <button onClick={exportCSV} style={{ marginTop: 8 }}>Export CSV</button>
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
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
          value={newDue}
          onChange={e => setNewDue(e.target.value)}
        />
        <select value={newPriority} onChange={e => setNewPriority(e.target.value)}>
          <option value="low">Low</option>
          <option value="normal">Normal</option>
          <option value="high">High</option>
        </select>
        <button onClick={addTask}>Add</button>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Done</th>
            <th>Title</th>
            <th>Description</th>
            <th>Due</th>
            <th>Priority</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {tasks.map(task => (
            <tr key={task.id}>
              <td style={{ textAlign: 'center' }}>
                <input
                  type="checkbox"
                  checked={task.done}
                  onChange={e => updateTask(task.id, { done: e.target.checked })}
                />
              </td>
              <td>
                <input
                  value={task.title}
                  onChange={e => updateTask(task.id, { title: e.target.value })}
                />
              </td>
              <td>
                <input
                  value={task.description || ''}
                  onChange={e => updateTask(task.id, { description: e.target.value })}
                />
              </td>
              <td>
                <input
                  type="date"
                  value={task.due_date || ''}
                  onChange={e => updateTask(task.id, { due_date: e.target.value || null })}
                />
              </td>
              <td>
                <select
                  value={task.priority}
                  onChange={e => updateTask(task.id, { priority: e.target.value })}
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                </select>
              </td>
              <td>
                <button onClick={() => deleteTask(task.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

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
