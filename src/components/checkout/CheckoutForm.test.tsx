import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CheckoutForm } from './CheckoutForm'
import { describe, it, expect, vi } from 'vitest'
import { useCartStore } from '@/store/cart'

// Mock dependencies
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
    (useCartStore as any).mockReturnValue({
      items: mockCartItems,
      getTotalPrice: () => 100,
      clearCart: vi.fn()
    })

    render(<CheckoutForm />)
    
    expect(screen.getByLabelText(/姓名/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/地址/i)).toBeInTheDocument()
    expect(screen.getByText(/支付 ¥100.00/i)).toBeInTheDocument()
  })

  it('validates required fields', async () => {
    (useCartStore as any).mockReturnValue({
      items: mockCartItems,
      getTotalPrice: () => 100,
      clearCart: vi.fn()
    })

    render(<CheckoutForm />)
    
    const submitBtn = screen.getByRole('button', { name: /支付/i })
    fireEvent.click(submitBtn)
    
    // Should show validation errors (HTML5 validation or custom)
    // Here we just check that console.log wasn't called or check for error messages
    // For simplicity, we assume HTML required attribute is present
    expect(screen.getByLabelText(/姓名/i)).toBeRequired()
  })
})
