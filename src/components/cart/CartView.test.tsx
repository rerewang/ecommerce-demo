import { render, screen, fireEvent } from '@testing-library/react'
import { CartView } from './CartView'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { CartItem } from '@/store/cart'

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      'title': '购物车',
      'empty': '购物车空空如也',
      'continueShopping': '去逛逛',
      'summary': '订单摘要',
      'subtotal': '商品总价',
      'total': '总计',
      'checkout': '前往结算',
      'removeItem': '移除商品',
      'decreaseQuantity': '减少数量',
      'increaseQuantity': '增加数量'
    }
    return translations[key] || key
  }
}))

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
    expect(screen.getByText(/总计/)).toBeInTheDocument()
    expect(screen.getByText(/¥200.00/)).toBeInTheDocument()
  })

  it('calls removeItem when trash button clicked', () => {
    mockStore.items = mockItems
    mockStore.getTotalPrice.mockReturnValue(200)

    render(<CartView />)
    
    const removeButton = screen.getByLabelText(/移除商品/i)
    fireEvent.click(removeButton)

    expect(mockStore.removeItem).toHaveBeenCalledWith('1')
    expect(mockStore.removeItem).toHaveBeenCalledTimes(1)
  })

  it('calls updateQuantity when minus button clicked', () => {
    mockStore.items = mockItems
    mockStore.getTotalPrice.mockReturnValue(200)

    render(<CartView />)
    
    const minusButton = screen.getByLabelText(/减少数量/i)
    fireEvent.click(minusButton)

    expect(mockStore.updateQuantity).toHaveBeenCalledWith('1', 1)
    expect(mockStore.updateQuantity).toHaveBeenCalledTimes(1)
  })

  it('calls updateQuantity when plus button clicked', () => {
    mockStore.items = mockItems
    mockStore.getTotalPrice.mockReturnValue(200)

    render(<CartView />)
    
    const plusButton = screen.getByLabelText(/增加数量/i)
    fireEvent.click(plusButton)

    expect(mockStore.updateQuantity).toHaveBeenCalledWith('1', 3)
    expect(mockStore.updateQuantity).toHaveBeenCalledTimes(1)
  })

  it('shows checkout button with correct link when items exist', () => {
    mockStore.items = mockItems
    mockStore.getTotalPrice.mockReturnValue(200)

    render(<CartView />)
    
    const checkoutButton = screen.getByText(/前往结算/i)
    expect(checkoutButton).toBeInTheDocument()
    
    const checkoutLink = checkoutButton.closest('a')
    expect(checkoutLink).toHaveAttribute('href', '/checkout')
  })

  it('does not decrease quantity below 1', () => {
    const singleItemCart: CartItem[] = [{
      ...mockItems[0],
      quantity: 1
    }]
    mockStore.items = singleItemCart
    mockStore.getTotalPrice.mockReturnValue(100)

    render(<CartView />)
    
    const minusButton = screen.getByLabelText(/减少数量/i)
    fireEvent.click(minusButton)

    expect(mockStore.updateQuantity).toHaveBeenCalledWith('1', 1)
  })
})
