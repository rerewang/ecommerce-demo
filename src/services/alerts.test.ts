import { describe, test, expect, vi } from 'vitest'
import { createAlert, getUserAlerts } from './alerts'

const mockAlertData = {
  id: 'alert-1',
  user_id: 'user-1',
  product_id: 'prod-1',
  type: 'price_drop',
  target_price: 100,
  status: 'active',
  created_at: new Date().toISOString()
}

// Mock chain helper
const createQueryChain = <T,>(returnData: T) => {
  const chain = {
    select: vi.fn(),
    insert: vi.fn(),
    eq: vi.fn(),
    order: vi.fn(),
    single: vi.fn(() => Promise.resolve({ data: returnData, error: null })),
    then: (onfulfilled: (value: { data: T; error: null }) => unknown) =>
      Promise.resolve({ data: returnData, error: null }).then(onfulfilled),
  } as const

  chain.select.mockReturnValue(chain)
  chain.insert.mockReturnValue(chain)
  chain.eq.mockReturnValue(chain)
  chain.order.mockReturnValue(chain)

  return chain
}

const mockSupabase = {
  from: vi.fn(() => createQueryChain(mockAlertData))
}

describe('Alerts Service', () => {
  test('createAlert inserts and returns alert', async () => {
    // @ts-expect-error mock client is loosely typed
    const alert = await createAlert('user-1', 'prod-1', 'price_drop', 100, mockSupabase)
    
    expect(mockSupabase.from).toHaveBeenCalledWith('product_alerts')
    expect(alert.id).toBe('alert-1')
    expect(alert.targetPrice).toBe(100)
  })

  test('price_drop alert without targetPrice uses current product price', async () => {
    const product = { id: 'prod-1', price: 150 }
    
    // Mock for product lookup
    const productQuery = {
      select: vi.fn(),
      eq: vi.fn(),
      single: vi.fn().mockResolvedValue({ data: product, error: null })
    }
    productQuery.select.mockReturnValue(productQuery)
    productQuery.eq.mockReturnValue(productQuery)
    
    // Mock for alert insert
    const alertInsert = {
      insert: vi.fn(),
      select: vi.fn(),
      single: vi.fn().mockResolvedValue({ 
        data: { ...mockAlertData, target_price: 150 }, 
        error: null 
      })
    }
    alertInsert.insert.mockReturnValue(alertInsert)
    alertInsert.select.mockReturnValue(alertInsert)
    
    const mockClient = {
      from: vi.fn((table) => {
        if (table === 'products') return productQuery
        if (table === 'product_alerts') return alertInsert
        return {}
      })
    }
    
    // @ts-expect-error mock client is loosely typed; omit targetPrice
    const alert = await createAlert('user-1', 'prod-1', 'price_drop', undefined, mockClient)
    
    expect(alertInsert.insert).toHaveBeenCalledWith(
      expect.objectContaining({ target_price: 150 })
    )
    expect(alert.targetPrice).toBe(150)
  })

  test('getUserAlerts fetches alerts for user', async () => {
    const mockList = [mockAlertData, { ...mockAlertData, id: 'alert-2' }]
    const listClient = {
      from: vi.fn(() => {
        const chain = {
          select: vi.fn(),
          eq: vi.fn(),
          order: vi.fn(() => Promise.resolve({ data: mockList, error: null }))
        }
        chain.select.mockReturnValue(chain)
        chain.eq.mockReturnValue(chain)
        return chain
      })
    }

    // @ts-expect-error mock client is loosely typed
    const alerts = await getUserAlerts('user-1', listClient)
    
    expect(listClient.from).toHaveBeenCalledWith('product_alerts')
    expect(alerts).toHaveLength(2)
  })
})
