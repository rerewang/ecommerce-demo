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

// Mock GlobalSearch
vi.mock('@/components/ui/GlobalSearch', () => ({
  GlobalSearch: () => <div data-testid="global-search">Search</div>,
}))

// Mock NotificationBell
vi.mock('@/components/ui/NotificationBell', () => ({
  NotificationBell: () => <div data-testid="notification-bell">Bell</div>,
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

// Default user mock (guest)
const mockGetUser = vi.fn().mockResolvedValue({ data: { user: null } })

vi.mock('@supabase/ssr', () => ({
  createServerClient: () => ({
    auth: {
      getUser: mockGetUser,
    },
  }),
}))

describe('Header', () => {
  it('renders mobile nav and cart badge', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } })
    const header = await Header()
    render(header)
    
    expect(screen.getByTestId('mobile-nav')).toBeInTheDocument()
    expect(screen.getAllByTestId('cart-badge')).toHaveLength(2)
  })

  it('renders branding with correct font', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } })
    const header = await Header()
    render(header)
    
    const brand = screen.getByRole('heading', { name: /PetPixel/i })
    expect(brand).toHaveClass('font-serif')
  })

  it('renders desktop navigation links on the left', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } })
    const header = await Header()
    render(header)
    
    const nav = screen.getByRole('navigation')
    expect(nav).toBeInTheDocument()
    expect(screen.getAllByText('Home')[0]).toBeVisible()
    expect(screen.getAllByText('Gallery')[0]).toBeVisible()
  })

  it('renders search bar', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } })
    const header = await Header()
    render(header)
    
    expect(screen.getByTestId('global-search')).toBeInTheDocument()
  })

  it('shows Admin link only for admin user', async () => {
    mockGetUser.mockResolvedValueOnce({ 
      data: { 
        user: { 
          id: '123', 
          email: 'admin@example.com', 
          role: 'admin' 
        } 
      } 
    })
    
    const header = await Header()
    render(header)
    
    expect(screen.getByText('Admin')).toBeInTheDocument()
  })

  it('hides Admin link for regular user', async () => {
    mockGetUser.mockResolvedValueOnce({ 
      data: { 
        user: { 
          id: '456', 
          email: 'user@example.com', 
          role: 'customer' 
        } 
      } 
    })
    
    const header = await Header()
    render(header)
    
    expect(screen.queryByText('Admin')).not.toBeInTheDocument()
    expect(screen.getByText('My Orders')).toBeInTheDocument()
  })
})
