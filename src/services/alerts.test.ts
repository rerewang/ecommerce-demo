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
const createQueryChain = (returnData: any) => {
  const chain: any = {}
  chain.select = vi.fn(() => chain)
  chain.insert = vi.fn(() => chain)
  chain.eq = vi.fn(() => chain)
  chain.order = vi.fn(() => chain)
  chain.single = vi.fn(() => Promise.resolve({ data: returnData, error: null }))
  chain.then = (onfulfilled: any) => Promise.resolve({ data: returnData, error: null }).then(onfulfilled)
  return chain
}

const mockSupabase = {
  from: vi.fn(() => createQueryChain(mockAlertData))
}

describe('Alerts Service', () => {
  test('createAlert inserts and returns alert', async () => {
    // @ts-ignore
    const alert = await createAlert('user-1', 'prod-1', 'price_drop', 100, mockSupabase)
    
    expect(mockSupabase.from).toHaveBeenCalledWith('product_alerts')
    expect(alert.id).toBe('alert-1')
    expect(alert.targetPrice).toBe(100)
  })

  test('price_drop alert without targetPrice uses current product price', async () => {
    const product = { id: 'prod-1', price: 150 }
    
    // Mock for product lookup
    const productQuery: any = {}
    productQuery.select = vi.fn(() => productQuery)
    productQuery.eq = vi.fn(() => productQuery)
    productQuery.single = vi.fn().mockResolvedValue({ data: product, error: null })
    
    // Mock for alert insert
    const alertInsert: any = {}
    alertInsert.insert = vi.fn(() => alertInsert)
    alertInsert.select = vi.fn(() => alertInsert)
    alertInsert.single = vi.fn().mockResolvedValue({ 
      data: { ...mockAlertData, target_price: 150 }, 
      error: null 
    })
    
    const mockClient = {
      from: vi.fn((table) => {
        if (table === 'products') return productQuery
        if (table === 'product_alerts') return alertInsert
        return {}
      })
    }
    
    // @ts-ignore - Call without targetPrice
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
        const chain: any = {}
        chain.select = vi.fn(() => chain)
        chain.eq = vi.fn(() => chain)
        chain.order = vi.fn(() => Promise.resolve({ data: mockList, error: null }))
        return chain
      })
    }

    // @ts-ignore
    const alerts = await getUserAlerts('user-1', listClient)
    
    expect(listClient.from).toHaveBeenCalledWith('product_alerts')
    expect(alerts).toHaveLength(2)
  })
})
