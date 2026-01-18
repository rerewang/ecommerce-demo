import { describe, test, expect, vi } from 'vitest'
import { createServerClient } from './supabase-server'

vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({
    get: () => ({ value: 'mock-session-token' }),
    getAll: () => [{ name: 'sb-token', value: 'mock-session-token' }],
    set: vi.fn()
  }))
}))

describe('createServerClient', () => {
  test('creates Supabase client with cookie access', async () => {
    const client = await createServerClient()
    expect(client).toBeDefined()
    expect(client.auth).toBeDefined()
  })
})
