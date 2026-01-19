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

  it('sorts products by price ascending', async () => {
    const mockQuery = {
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ 
        data: [mockProducts[1], mockProducts[0]], 
        error: null 
      })
    }

    vi.mocked(supabase.from).mockReturnValue(mockQuery as unknown as ReturnType<typeof supabase.from>)

    const result = await getProducts({ sort: 'price_asc' })

    expect(mockQuery.order).toHaveBeenCalledWith('price', { ascending: true })
    expect(result[0].price).toBeLessThan(result[1].price)
  })

  it('sorts products by price descending', async () => {
    const mockQuery = {
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ 
        data: [mockProducts[0], mockProducts[1]], 
        error: null 
      })
    }

    vi.mocked(supabase.from).mockReturnValue(mockQuery as unknown as ReturnType<typeof supabase.from>)

    const result = await getProducts({ sort: 'price_desc' })

    expect(mockQuery.order).toHaveBeenCalledWith('price', { ascending: false })
    expect(result[0].price).toBeGreaterThan(result[1].price)
  })

  it('defaults to newest sort when no sort specified', async () => {
    const mockQuery = {
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ 
        data: mockProducts, 
        error: null 
      })
    }

    vi.mocked(supabase.from).mockReturnValue(mockQuery as unknown as ReturnType<typeof supabase.from>)

    await getProducts()

    expect(mockQuery.order).toHaveBeenCalledWith('created_at', { ascending: false })
  })

  it('returns products with metadata', async () => {
    const mockProductWithMetadata = {
      ...mockProducts[0],
      metadata: { features: { Chip: 'A17' } }
    }
    const mockQuery = {
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ 
        data: [mockProductWithMetadata], 
        error: null 
      })
    }

    vi.mocked(supabase.from).mockReturnValue(mockQuery as unknown as ReturnType<typeof supabase.from>)

    const result = await getProducts()
    expect(result[0].metadata).toEqual({ features: { Chip: 'A17' } })
  })
})
