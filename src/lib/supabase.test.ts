import { describe, test, expect, vi } from 'vitest'
import { createServerClient } from './supabase'

vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({
    get: () => ({ value: 'mock-session-token' })
  }))
}))

describe('createServerClient', () => {
  test('creates Supabase client with cookie access', async () => {
    const client = await createServerClient()
    expect(client).toBeDefined()
    expect(client.auth).toBeDefined()
  })
})
