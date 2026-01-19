import { describe, it, expect, beforeEach, vi } from 'vitest'
import { getProducts } from './products'
import { supabase } from '@/lib/supabase'

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn()
  }
}))

describe('getProducts', () => {
  const mockProducts = [
    { id: '1', name: 'iPhone', category: 'Electronics', price: 999, stock: 10 },
    { id: '2', name: 'Keyboard', category: 'Accessories', price: 129, stock: 20 }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('filters products by category', async () => {
    const mockQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ 
        data: [mockProducts[0]], 
        error: null 
      })
    }

    vi.mocked(supabase.from).mockReturnValue(mockQuery as unknown as ReturnType<typeof supabase.from>)

    const result = await getProducts({ category: 'Electronics' })

    expect(supabase.from).toHaveBeenCalledWith('products')
    expect(mockQuery.eq).toHaveBeenCalledWith('category', 'Electronics')
    expect(result).toHaveLength(1)
    expect(result[0].category).toBe('Electronics')
  })

  it('filters products by search query (case-insensitive)', async () => {
    const mockQuery = {
      select: vi.fn().mockReturnThis(),
      ilike: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ 
        data: [mockProducts[0]], 
        error: null 
      })
    }

    vi.mocked(supabase.from).mockReturnValue(mockQuery as unknown as ReturnType<typeof supabase.from>)

    const result = await getProducts({ query: 'iphone' })

    expect(mockQuery.ilike).toHaveBeenCalledWith('name', '%iphone%')
    expect(result).toHaveLength(1)
  })
})
