import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { z } from 'zod'
import { getUsername, setUsername } from '../features/auth/session'
import { ApiError, apiFetch } from './client'

const okJson = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

describe('apiFetch', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })
  afterEach(() => vi.unstubAllGlobals())

  it('attaches X-DM-Username header when a session exists', async () => {
    setUsername('aldous')
    const fetchMock = vi.fn().mockResolvedValue(okJson({ a: 1 }))
    vi.stubGlobal('fetch', fetchMock)
    await apiFetch('/api/campaigns', z.object({ a: z.number() }))
    const headers = new Headers(fetchMock.mock.calls[0][1]?.headers)
    expect(headers.get('X-DM-Username')).toBe('aldous')
  })

  it('parses and validates the response body', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(okJson({ id: 'x', name: 'y' })))
    const result = await apiFetch('/api/thing', z.object({ id: z.string(), name: z.string() }))
    expect(result).toEqual({ id: 'x', name: 'y' })
  })

  it('throws ApiError with the server message on 4xx', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(okJson({ error: 'name is required' }, 400)))
    await expect(apiFetch('/api/thing', z.unknown())).rejects.toMatchObject({
      message: 'name is required',
      status: 400,
    })
  })

  it('clears the session and emits an event on 401', async () => {
    setUsername('aldous')
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(okJson({ error: 'Unauthorized' }, 401)))
    const listener = vi.fn()
    window.addEventListener('dicefight:unauthorized', listener)
    await expect(apiFetch('/api/thing', z.unknown())).rejects.toBeInstanceOf(ApiError)
    expect(getUsername()).toBeNull()
    expect(listener).toHaveBeenCalled()
    window.removeEventListener('dicefight:unauthorized', listener)
  })

  it('returns undefined for 204 responses', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 204 })))
    const result = await apiFetch('/api/thing', z.void())
    expect(result).toBeUndefined()
  })
})
