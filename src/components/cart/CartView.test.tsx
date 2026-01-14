import { render, screen } from '@testing-library/react'
import { CartView } from './CartView'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { CartItem } from '@/store/cart'

const mockItems: CartItem[] = [
  {
    product: {
      id: '1',
      name: 'Test Product 1',
      description: 'Desc',
      price: 100,
      image_url: 'img1.jpg',
      stock: 10,
      category: 'Test',
      created_at: 'date'
    },
    quantity: 2
  }
]

const mockStore = {
  items: [] as CartItem[],
  removeItem: vi.fn(),
  updateQuantity: vi.fn(),
  getTotalPrice: vi.fn(() => 0),
  getTotalItems: vi.fn(() => 0),
}

type CartState = typeof mockStore
type CartSelector<T> = (state: CartState) => T

vi.mock('@/store/cart', () => ({
  useCartStore: <T,>(selector: CartSelector<T>) => {
    const state = mockStore
    return selector ? selector(state) : state
  }
}))

describe('CartView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockStore.items = []
  })

  it('shows empty state when no items', () => {
    render(<CartView />)
    expect(screen.getByText(/购物车空空如也/i)).toBeInTheDocument()
    expect(screen.getByText(/去逛逛/i)).toBeInTheDocument()
  })

  it('shows items when cart is populated', () => {
    mockStore.items = mockItems
    mockStore.getTotalPrice.mockReturnValue(200)

    render(<CartView />)
    
    expect(screen.getByText('Test Product 1')).toBeInTheDocument()
    expect(screen.getByText('¥100.00')).toBeInTheDocument()
    expect(screen.getByText('总计: ¥200.00')).toBeInTheDocument()
  })
})
