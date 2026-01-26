import { render, screen } from '@testing-library/react'
import { Header } from './Header'
import { describe, it, expect, vi } from 'vitest'

// Mock MobileNav since it's tested separately
vi.mock('./MobileNav', () => ({
  MobileNav: () => <div data-testid="mobile-nav">MobileNav</div>,
}))

// Mock CartBadge
vi.mock('@/components/cart/CartBadge', () => ({
  CartBadge: () => <div data-testid="cart-badge">CartBadge</div>,
}))

// Mock Next.js cookies and Supabase
vi.mock('next/headers', () => ({
  cookies: () => ({
    getAll: () => [],
  }),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => ({ get: vi.fn() }),
  usePathname: () => '/',
}))

vi.mock('@supabase/ssr', () => ({
  createServerClient: () => ({
    auth: {
      getUser: () => Promise.resolve({ data: { user: null } }),
    },
  }),
}))

describe('Header', () => {
  it('renders mobile nav and cart badge', async () => {
    const header = await Header()
    render(header)
    
    expect(screen.getByTestId('mobile-nav')).toBeInTheDocument()
    expect(screen.getAllByTestId('cart-badge')).toHaveLength(2) // One for desktop, one for mobile
  })

  it('renders branding with correct font', async () => {
    const header = await Header()
    render(header)
    
    const brand = screen.getByRole('heading', { name: /PetPixel/i })
    expect(brand).toHaveClass('font-serif')
  })

  it('renders desktop navigation links', async () => {
    const header = await Header()
    render(header)
    
    const nav = screen.getByRole('navigation')
    expect(nav).toBeInTheDocument()
    expect(screen.getAllByText('Home')[0]).toBeVisible()
    expect(screen.getAllByText('Gallery')[0]).toBeVisible()
  })
})