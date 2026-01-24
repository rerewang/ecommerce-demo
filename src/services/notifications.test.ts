import { describe, test, expect, vi, beforeEach } from 'vitest'
import { checkAlertsForProduct } from './notifications'

// Mock dependencies
const mockSupabase = {
  from: vi.fn(),
}

describe('checkAlertsForProduct', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Helper to setup mock chain
  const setupMockAlerts = (alerts: any[]) => {
    const builder: any = {}
    builder.select = vi.fn(() => builder)
    builder.eq = vi.fn(() => builder)
    builder.update = vi.fn(() => builder)
    builder.in = vi.fn(() => builder)
    builder.then = (resolve: any) => Promise.resolve({ data: alerts, error: null }).then(resolve)
    
    mockSupabase.from.mockImplementation((table) => {
      if (table === 'product_alerts') return builder
      if (table === 'notifications') return { insert: vi.fn().mockResolvedValue({ error: null }) }
      return {}
    })
    
    return builder
  }

  test('should trigger price_drop alert when price is below target', async () => {
    const alerts = [{
      id: 'alert-1',
      user_id: 'user-1',
      type: 'price_drop',
      target_price: 100,
      status: 'active'
    }]
    
    const builder = setupMockAlerts(alerts)
    const insertNotificationMock = vi.fn().mockResolvedValue({ error: null })
    mockSupabase.from.mockImplementation((table) => {
      if (table === 'product_alerts') return builder
      if (table === 'notifications') return { insert: insertNotificationMock }
      return {}
    })

    // Act
    // @ts-ignore
    await checkAlertsForProduct('prod-1', 90, 10, mockSupabase, 'price_drop')

    // Assert
    expect(insertNotificationMock).toHaveBeenCalled()
    expect(builder.eq).toHaveBeenCalledWith('type', 'price_drop')
  })

  test('should NOT trigger price_drop alert if price is above target', async () => {
    const alerts = [{
      id: 'alert-1',
      user_id: 'user-1',
      type: 'price_drop',
      target_price: 80,
      status: 'active'
    }]
    
    const builder = setupMockAlerts(alerts)
    const insertNotificationMock = vi.fn().mockResolvedValue({ error: null })
    mockSupabase.from.mockImplementation((table) => {
        if (table === 'product_alerts') return builder
        if (table === 'notifications') return { insert: insertNotificationMock }
        return {}
    })

    // Act
    // @ts-ignore
    await checkAlertsForProduct('prod-1', 90, 10, mockSupabase, 'price_drop')

    // Assert
    expect(insertNotificationMock).not.toHaveBeenCalled()
  })

  test('should NOT trigger restock alert when only checking price drop', async () => {
    const alerts = [{
      id: 'alert-restock',
      user_id: 'user-2',
      type: 'restock',
      status: 'active'
    }]

    const builder: any = {}
    builder.select = vi.fn(() => builder)
    builder.update = vi.fn(() => builder)
    builder.in = vi.fn(() => builder)
    
    const filters: Record<string, any> = {}
    builder.eq = vi.fn((col, val) => {
        filters[col] = val
        return builder
    })
    
    builder.then = (resolve: any) => {
        let result = alerts
        if (filters['type'] && filters['type'] !== 'restock') {
            result = []
        }
        return Promise.resolve({ data: result, error: null }).then(resolve)
    }

    const insertNotificationMock = vi.fn().mockResolvedValue({ error: null })
    mockSupabase.from.mockImplementation((table) => {
      if (table === 'product_alerts') return builder
      if (table === 'notifications') return { insert: insertNotificationMock }
      return {}
    })

    // @ts-ignore
    await checkAlertsForProduct('prod-1', 90, 10, mockSupabase, 'price_drop')

    expect(builder.eq).toHaveBeenCalledWith('type', 'price_drop')
    expect(insertNotificationMock).not.toHaveBeenCalled()
  })
})
