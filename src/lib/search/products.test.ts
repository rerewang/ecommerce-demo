import { describe, it, expect, vi, beforeEach } from 'vitest'
import { searchProducts } from './products'

vi.mock('@/lib/ai/embedding', () => ({
  generateEmbedding: vi.fn().mockResolvedValue([0.1, 0.2, 0.3])
}))

const mockRpc = vi.fn()
const mockSupabase = {
  rpc: mockRpc
}

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => mockSupabase)
}))

vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({
    getAll: vi.fn().mockReturnValue([]),
    set: vi.fn()
  })
}))

describe('searchProducts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return empty array for empty query', async () => {
    const result = await searchProducts('')
    expect(result).toEqual([])
    expect(mockRpc).not.toHaveBeenCalled()
  })

  it('should use hybrid search and return results on success', async () => {
    const mockData = [{ id: '1', name: 'Product 1' }]
    
    mockRpc.mockResolvedValueOnce({ data: mockData, error: null })

    const result = await searchProducts('test query')

    expect(mockRpc).toHaveBeenCalledWith('match_products_hybrid', expect.objectContaining({
      query_text: 'test query',
      match_count: 10
    }))
    
    expect(mockRpc).toHaveBeenCalledTimes(1)
    expect(result).toEqual(mockData)
  })

  it('should fallback to vector search when hybrid search fails', async () => {
    const mockFallbackData = [{ id: '2', name: 'Product 2' }]
    
    mockRpc.mockResolvedValueOnce({ 
      data: null, 
      error: { message: 'function match_products_hybrid does not exist' } 
    })
    
    mockRpc.mockResolvedValueOnce({ 
      data: mockFallbackData, 
      error: null 
    })

    const result = await searchProducts('test query')

    expect(mockRpc).toHaveBeenNthCalledWith(1, 'match_products_hybrid', expect.anything())
    
    expect(mockRpc).toHaveBeenNthCalledWith(2, 'match_products', expect.objectContaining({
      match_threshold: 0.5,
      match_count: 10
    }))

    expect(result).toEqual(mockFallbackData)
  })

  it('should return empty array when both search methods fail', async () => {
    mockRpc.mockResolvedValueOnce({ 
      data: null, 
      error: { message: 'function match_products_hybrid does not exist' } 
    })
    
    mockRpc.mockResolvedValueOnce({ 
      data: null, 
      error: { message: 'Something went wrong' } 
    })

    const result = await searchProducts('test query')

    expect(mockRpc).toHaveBeenCalledTimes(2)
    expect(result).toEqual([])
  })
})
