import { render, screen } from '@testing-library/react'
import { ProductCard } from './ProductCard'
import { describe, it, expect } from 'vitest'

const mockProduct = {
  id: '1',
  name: 'Test Product',
  description: 'Test Description',
  price: 99.99,
  image_url: 'https://images.unsplash.com/photo-123',
  stock: 10,
  category: 'Test',
  created_at: '2025-01-01T00:00:00Z'
}

describe('ProductCard', () => {
  it('renders product information correctly', () => {
    render(<ProductCard product={mockProduct} />)
    
    expect(screen.getByText('Test Product')).toBeInTheDocument()
    expect(screen.getByText('¥99.99')).toBeInTheDocument()
    expect(screen.getByAltText('Test Product')).toHaveAttribute('src', 'https://images.unsplash.com/photo-123')
  })

  it('shows out of stock message when stock is 0', () => {
    render(<ProductCard product={{ ...mockProduct, stock: 0 }} />)
    
    expect(screen.getByText('已售罄')).toBeInTheDocument()
    expect(screen.getByRole('button')).toBeDisabled()
  })
})
