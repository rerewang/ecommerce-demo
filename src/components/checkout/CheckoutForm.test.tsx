import { render, screen, fireEvent } from '@testing-library/react'
import { CheckoutForm } from './CheckoutForm'
import { describe, it, expect, vi } from 'vitest'
import { useCartStore } from '@/store/cart'

vi.mock('@/store/cart', () => ({
  useCartStore: vi.fn()
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn()
  })
}))

const mockCartItems = [
  {
    product: { id: '1', name: 'Item 1', price: 100 },
    quantity: 1
  }
]

describe('CheckoutForm', () => {
  it('renders form fields', () => {
    vi.mocked(useCartStore).mockReturnValue({
      items: mockCartItems,
      getTotalPrice: () => 100,
      clearCart: vi.fn()
    } as ReturnType<typeof useCartStore>)

    render(<CheckoutForm />)
    
    expect(screen.getByLabelText(/姓名/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/地址/i)).toBeInTheDocument()
    expect(screen.getByText(/支付 ¥100.00/i)).toBeInTheDocument()
  })

  it('validates required fields', async () => {
    vi.mocked(useCartStore).mockReturnValue({
      items: mockCartItems,
      getTotalPrice: () => 100,
      clearCart: vi.fn()
    } as ReturnType<typeof useCartStore>)

    render(<CheckoutForm />)
    
    const submitBtn = screen.getByRole('button', { name: /支付/i })
    fireEvent.click(submitBtn)
    
    expect(screen.getByLabelText(/姓名/i)).toBeRequired()
  })
})
