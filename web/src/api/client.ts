import type { ZodType } from 'zod'
import { clearUsername, getUsername } from '../features/auth/session'

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export async function apiFetch<T>(
  path: string,
  schema: ZodType<T>,
  init?: RequestInit,
): Promise<T> {
  const headers = new Headers(init?.headers)
  const username = getUsername()
  if (username) headers.set('X-DM-Username', username)
  if (init?.body) headers.set('Content-Type', 'application/json')

  const res = await fetch(path, { ...init, headers })

  if (!res.ok) {
    let message = `Request failed (${res.status})`
    try {
      const body = await res.json()
      if (typeof body?.error === 'string') message = body.error
    } catch {
      // non-JSON error body — keep the generic message
    }
    if (res.status === 401) {
      clearUsername()
      window.dispatchEvent(new Event('dicefight:unauthorized'))
    }
    throw new ApiError(message, res.status)
  }

  if (res.status === 204) return undefined as T
  return schema.parse(await res.json())
}
