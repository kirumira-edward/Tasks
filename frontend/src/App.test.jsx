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
