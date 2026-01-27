import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CheckoutForm } from './CheckoutForm'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useCartStore } from '@/store/cart'
import { supabase } from '@/lib/supabase'
import * as ordersService from '@/services/orders'

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string, params?: { amount?: string }) => {
    const translations: Record<string, string> = {
      'contact': '联系信息',
      'form.name': '姓名',
      'shipping': '收货地址',
      'form.address': '地址',
      'form.city': '城市',
      'form.zip': '邮编',
      'payment': '支付方式',
      'pay': `支付 ${params?.amount || ''}`,
      'paying': '正在支付',
      'creatingOrder': '创建订单中',
      'emptyCart': '购物车为空',
      'paymentMethods.alipay': '支付宝',
      'paymentMethods.wechat': '微信支付',
      'paymentMethods.card': '信用卡',
      'total': '总计'
    }
    return translations[key] || key
  }
}))

vi.mock('@/store/cart', () => ({
  useCartStore: vi.fn()
}))

vi.mock('@/services/orders', () => ({
  updateOrderStatus: vi.fn().mockResolvedValue(undefined)
}))

vi.mock('@/lib/supabase', async () => {
  const actual = await vi.importActual('@/lib/supabase')
  return {
    ...actual,
    createClientComponentClient: vi.fn(() => ({
      from: vi.fn(() => ({
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({ data: { id: 'order-123' }, error: null })
          }))
        }))
      })),
      rpc: vi.fn().mockResolvedValue({ error: null })
    })),
    supabase: {
      auth: {
        getUser: vi.fn()
      }
    }
  }
})

const mockRouterPush = vi.fn()
const mockRouterRefresh = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockRouterPush,
    refresh: mockRouterRefresh
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
    
    // Clear router mocks
    mockRouterPush.mockClear()
    mockRouterRefresh.mockClear()
    
    // Clear service mocks
    vi.mocked(ordersService.updateOrderStatus).mockClear()
  })

  it('renders form fields', async () => {
    vi.mocked(useCartStore).mockReturnValue({
      items: mockCartItems,
      getTotalPrice: () => 100,
      clearCart: vi.fn()
    } as ReturnType<typeof useCartStore>)

    render(<CheckoutForm userId="test-user-id" />)
    
    // Auth check is no longer done in client, so we don't need to wait for it
    expect(screen.queryByText(/正在验证登录状态/i)).not.toBeInTheDocument()

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

    render(<CheckoutForm userId="test-user-id" />)
    
    expect(screen.queryByText(/正在验证登录状态/i)).not.toBeInTheDocument()
    
    const submitBtn = screen.getByRole('button', { name: /支付 ¥/i })
    fireEvent.click(submitBtn)
    
    expect(screen.getByLabelText(/姓名/i)).toBeRequired()
  })

  it('submits order successfully, clears cart, and redirects', async () => {
    const mockClearCart = vi.fn()

    vi.mocked(useCartStore).mockReturnValue({
      items: mockCartItems,
      getTotalPrice: () => 100,
      clearCart: mockClearCart
    } as ReturnType<typeof useCartStore>)

    render(<CheckoutForm userId="test-user-id" />)

    // Fill form
    fireEvent.change(screen.getByLabelText(/姓名/i), { target: { value: 'John Doe' } })
    fireEvent.change(screen.getByLabelText(/地址/i), { target: { value: '123 Main St' } })
    fireEvent.change(screen.getByLabelText(/城市/i), { target: { value: 'Beijing' } })
    fireEvent.change(screen.getByLabelText(/邮编/i), { target: { value: '100000' } })

    // Submit
    const submitBtn = screen.getByRole('button', { name: /支付 ¥/i })
    fireEvent.click(submitBtn)

    // Verify loading state
    await waitFor(() => {
      expect(screen.getByText(/创建订单中/i)).toBeInTheDocument()
    })

    // Wait for processing
    await waitFor(() => {
      expect(screen.getByText(/正在支付/i)).toBeInTheDocument()
    }, { timeout: 3000 })

    // Wait for completion
    await waitFor(() => {
      expect(mockClearCart).toHaveBeenCalled()
    }, { timeout: 3000 })

    await waitFor(() => {
      expect(mockRouterRefresh).toHaveBeenCalled()
      expect(mockRouterPush).toHaveBeenCalledWith('/orders/order-123')
    })
  })

  it('handles submission errors gracefully', async () => {
    const mockClearCart = vi.fn()
    const mockAlert = vi.spyOn(window, 'alert').mockImplementation(() => {})

    vi.mocked(useCartStore).mockReturnValue({
      items: mockCartItems,
      getTotalPrice: () => 100,
      clearCart: mockClearCart
    } as ReturnType<typeof useCartStore>)

    const { createClientComponentClient } = await import('@/lib/supabase')
    const mockInsert = vi.fn(() => ({
      select: vi.fn(() => ({
        single: vi.fn().mockResolvedValue({ 
          data: null, 
          error: { message: 'Database error' } 
        })
      }))
    }))

    vi.mocked(createClientComponentClient).mockReturnValue({
      from: vi.fn(() => ({
        insert: mockInsert
      })),
      rpc: vi.fn()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    render(<CheckoutForm userId="test-user-id" />)

    // Fill form
    fireEvent.change(screen.getByLabelText(/姓名/i), { target: { value: 'John Doe' } })
    fireEvent.change(screen.getByLabelText(/地址/i), { target: { value: '123 Main St' } })
    fireEvent.change(screen.getByLabelText(/城市/i), { target: { value: 'Beijing' } })
    fireEvent.change(screen.getByLabelText(/邮编/i), { target: { value: '100000' } })

    // Submit
    const submitBtn = screen.getByRole('button', { name: /支付 ¥/i })
    fireEvent.click(submitBtn)

    // Wait for error
    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith(expect.stringContaining('Failed to create order'))
    })

    // Verify cart was NOT cleared
    expect(mockClearCart).not.toHaveBeenCalled()

    mockAlert.mockRestore()
  })

  it('shows empty state when cart is empty', () => {
    vi.mocked(useCartStore).mockReturnValue({
      items: [],
      getTotalPrice: () => 0,
      clearCart: vi.fn()
    } as ReturnType<typeof useCartStore>)

    render(<CheckoutForm userId="test-user-id" />)

    expect(screen.getByText(/购物车为空/i)).toBeInTheDocument()
    expect(screen.queryByLabelText(/姓名/i)).not.toBeInTheDocument()
  })
})
