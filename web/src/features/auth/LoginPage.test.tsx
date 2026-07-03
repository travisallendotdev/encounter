import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { LoginPage } from './LoginPage'
import { getUsername } from './session'

vi.mock('../../api/endpoints', () => ({
  login: vi.fn().mockResolvedValue({ id: 'dm-1', username: 'aldous' }),
}))

function renderLogin() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/campaigns" element={<div>campaigns page</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('LoginPage', () => {
  beforeEach(() => localStorage.clear())

  it('logs in and stores the username', async () => {
    renderLogin()
    await userEvent.type(screen.getByLabelText(/dungeon master name/i), 'aldous')
    await userEvent.click(screen.getByRole('button', { name: /take your seat/i }))
    expect(await screen.findByText('campaigns page')).toBeInTheDocument()
    expect(getUsername()).toBe('aldous')
  })

  it('requires a name before submitting', async () => {
    renderLogin()
    await userEvent.click(screen.getByRole('button', { name: /take your seat/i }))
    expect(await screen.findByText(/name is required/i)).toBeInTheDocument()
    expect(getUsername()).toBeNull()
  })
})
