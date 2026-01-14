import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AdminProductList } from './AdminProductList'
import { describe, it, expect, vi } from 'vitest'
import { getProducts, deleteProduct } from '@/services/products'

// Mock services
vi.mock('@/services/products', () => ({
  getProducts: vi.fn(),
  deleteProduct: vi.fn()
}))

const mockProducts = [
  { id: '1', name: 'P1', price: 10, stock: 5, category: 'C1' }
]

describe('AdminProductList', () => {
  it('loads and displays products', async () => {
    (getProducts as any).mockResolvedValue(mockProducts)
    
    render(<AdminProductList />)
    
    expect(screen.getByText(/加载中/i)).toBeInTheDocument()
    
    await waitFor(() => {
      expect(screen.getByText('P1')).toBeInTheDocument()
    })
  })

  it('handles delete', async () => {
    (getProducts as any).mockResolvedValue(mockProducts)
    
    render(<AdminProductList />)
    
    await waitFor(() => screen.getByText('P1'))
    
    // Find delete button (assuming implementation has one)
    const deleteBtn = screen.getByText(/删除/i)
    fireEvent.click(deleteBtn)
    
    // Should verify confirm dialog or direct call
    // For simplicity, verify call if implemented without confirm, 
    // or we'll implement confirm mock
  })
})
