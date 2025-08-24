import "@testing-library/jest-dom/vitest"
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import App from './App'
import { vi, expect, beforeEach, afterEach, test } from 'vitest'

beforeEach(() => {
  global.fetch = vi.fn()
})

afterEach(() => {
  vi.resetAllMocks()
})


test('adds a task and updates summary', async () => {
  fetch
    .mockResolvedValueOnce({ json: async () => [] }) // initial load
    .mockResolvedValueOnce({
      json: async () => ({
        id: 1,
        title: 'Test',
        description: '',
        due_date: null,
        priority: 'normal',
        done: false,
      }),
    })

  render(<App />)

  const titleInput = screen.getByPlaceholderText('Title')
  fireEvent.change(titleInput, { target: { value: 'Test' } })
  fireEvent.click(screen.getByText('Add'))

  await waitFor(() => screen.getByDisplayValue('Test'))
  expect(fetch).toHaveBeenCalledWith('http://localhost:8000/tasks', expect.objectContaining({ method: 'POST' }))
  expect(screen.getByDisplayValue('Test')).toBeInTheDocument()
  const summary = screen.getByText('Total:', { selector: 'strong' }).parentElement
  expect(summary).toHaveTextContent('Total:')
  expect(summary).toHaveTextContent('Completed:')
  expect(summary).toHaveTextContent('Pending:')
  expect(summary).toHaveTextContent('1')

test('adds a task', async () => {
  fetch
    .mockResolvedValueOnce({ json: async () => [] }) // initial load
    .mockResolvedValueOnce({ json: async () => ({ id: 1, title: 'Test', done: false }) })

  render(<App />)

  const input = screen.getByPlaceholderText('New task')
  fireEvent.change(input, { target: { value: 'Test' } })
  fireEvent.click(screen.getByText('Add'))

  await waitFor(() => screen.getByDisplayValue('Test'))
  expect(fetch).toHaveBeenCalledWith('http://localhost:8000/tasks', expect.anything())
  expect(screen.getByDisplayValue('Test')).toBeInTheDocument()

})
