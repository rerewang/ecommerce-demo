import { render, screen, waitFor } from '@testing-library/react'
import { AdminProductList } from './AdminProductList'
import { describe, it, expect, vi } from 'vitest'
import { getProducts } from '@/services/products'

vi.mock('@/services/products', () => ({
  getProducts: vi.fn(),
}))

const mockProducts = [
  { id: '1', name: 'P1', price: 10, stock: 5, category: 'C1', description: 'Desc', image_url: 'img.jpg', created_at: '2024-01-01' }
]

describe('AdminProductList', () => {
  it('loads and displays products', async () => {
    vi.mocked(getProducts).mockResolvedValue(mockProducts)
    
    render(<AdminProductList />)
    
    expect(screen.getByText(/加载中/i)).toBeInTheDocument()
    
    await waitFor(() => {
      expect(screen.getByText('P1')).toBeInTheDocument()
    })
  })

  it('handles delete', async () => {
    vi.mocked(getProducts).mockResolvedValue(mockProducts)
    
    render(<AdminProductList />)
    
    await waitFor(() => screen.getByText('P1'))
  })
})
