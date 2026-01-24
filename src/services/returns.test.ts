import { describe, test, expect, vi, beforeEach } from 'vitest'
import { checkReturnEligibility } from './returns'

// Mock getOrderById dependency
vi.mock('@/services/orders', () => ({
  getOrderById: vi.fn()
}))

import { getOrderById } from '@/services/orders'

const mockOrder = {
  id: 'order-1',
  userId: 'user-1',
  status: 'shipped',
  createdAt: new Date().toISOString(), // Today
  items: []
}

describe('Returns Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('checkReturnEligibility returns eligible for recent shipped order', async () => {
    // @ts-ignore
    vi.mocked(getOrderById).mockResolvedValue(mockOrder)

    // Mock returns check (empty)
    const mockClient = {
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            neq: vi.fn(() => Promise.resolve({ data: [], error: null }))
          }))
        }))
      }))
    }

    // @ts-ignore
    const result = await checkReturnEligibility('order-1', 'user-1', mockClient)
    
    expect(result.eligible).toBe(true)
    expect(result.daysSincePurchase).toBe(0)
  })

  test('checkReturnEligibility fails if return already exists', async () => {
    const mockClient = {
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            neq: vi.fn(() => Promise.resolve({ data: [{ id: 'ret-1', status: 'requested' }], error: null }))
          }))
        }))
      }))
    }

    // @ts-ignore
    const result = await checkReturnEligibility('order-1', 'user-1', mockClient)
    
    expect(result.eligible).toBe(false)
    expect(result.existingReturnId).toBe('ret-1')
  })
})
