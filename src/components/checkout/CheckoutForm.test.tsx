import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CheckoutForm } from './CheckoutForm'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useCartStore } from '@/store/cart'
import { supabase } from '@/lib/supabase'

vi.mock('@/store/cart', () => ({
  useCartStore: vi.fn()
}))

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn()
    }
  }
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
  beforeEach(() => {
    // Mock authenticated user by default
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: { id: 'test-user-id' } },
      error: null
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
  })

  it('renders form fields', async () => {
    vi.mocked(useCartStore).mockReturnValue({
      items: mockCartItems,
      getTotalPrice: () => 100,
      clearCart: vi.fn()
    } as ReturnType<typeof useCartStore>)

    render(<CheckoutForm />)
    
    // Wait for auth check to complete
    await waitFor(() => {
      expect(screen.queryByText(/正在验证登录状态/i)).not.toBeInTheDocument()
    })

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
    
    await waitFor(() => {
      expect(screen.queryByText(/正在验证登录状态/i)).not.toBeInTheDocument()
    })
    
    const submitBtn = screen.getByRole('button', { name: /支付/i })
    fireEvent.click(submitBtn)
    
    expect(screen.getByLabelText(/姓名/i)).toBeRequired()
  })
})
