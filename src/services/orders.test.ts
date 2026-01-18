import { describe, test, expect, vi } from 'vitest'
import { getUserOrders, getOrders } from './orders'

const mockOrderData = [
  { 
    id: 'order-1', 
    user_id: 'user-123', 
    status: 'paid', 
    total: 100,
    shipping_address: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    items: []
  }
]

type MockResult = { data: typeof mockOrderData; error: null }

interface QueryChain {
  eq: ReturnType<typeof vi.fn>
  order: ReturnType<typeof vi.fn>
  then: <T>(onfulfilled?: ((value: MockResult) => T | PromiseLike<T>) | null) => Promise<T>
  catch: <T>(onrejected?: ((reason: unknown) => T | PromiseLike<T>) | null) => Promise<MockResult | T>
}

const createQueryChain = (): QueryChain => {
  const chain = {} as QueryChain
  chain.eq = vi.fn(() => chain)
  chain.order = vi.fn(() => chain)
  chain.then = <T>(onfulfilled?: ((value: MockResult) => T | PromiseLike<T>) | null) => 
    Promise.resolve({ data: mockOrderData, error: null }).then(onfulfilled ?? undefined)
  chain.catch = <T>(onrejected?: ((reason: unknown) => T | PromiseLike<T>) | null) => 
    Promise.resolve({ data: mockOrderData, error: null }).catch(onrejected ?? undefined)
  return chain
}

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => createQueryChain())
    }))
  }
}))

describe('getUserOrders', () => {
  test('throws error when userId is empty', async () => {
    await expect(getUserOrders('', 'customer')).rejects.toThrow('Authentication required')
  })
  
  test('throws error when role is invalid', async () => {
    await expect(getUserOrders('user-123', 'invalid-role')).rejects.toThrow('Invalid role')
  })
  
  test('returns orders for customer role', async () => {
    const orders = await getUserOrders('user-123', 'customer')
    expect(orders).toBeDefined()
    expect(Array.isArray(orders)).toBe(true)
  })

  test('uses provided client if passed', async () => {
    const customMockClient = {
      from: vi.fn(() => ({
        select: vi.fn(() => createQueryChain())
      })),
      auth: {
        getUser: vi.fn(() => Promise.resolve({ data: { user: { id: 'user-123' } }, error: null }))
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await getUserOrders('user-123', 'customer', customMockClient as any)
    expect(customMockClient.from).toHaveBeenCalledWith('orders')
  })
})

describe('getOrders', () => {
  test('throws error when role is not admin', async () => {
    await expect(getOrders('user-123', 'customer')).rejects.toThrow('Unauthorized')
  })
  
  test('allows admin to view all orders', async () => {
    const orders = await getOrders('admin-456', 'admin')
    expect(orders).toBeDefined()
    expect(Array.isArray(orders)).toBe(true)
  })
})
