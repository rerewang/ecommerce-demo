import { render, screen, fireEvent } from '@testing-library/react'
import { MobileNav } from './MobileNav'
import { describe, it, expect, vi } from 'vitest'

// Mock next-intl
const messages: Record<string, string> = {
  home: 'Home',
  gallery: 'Gallery',
  aiAssistant: 'AI Assistant',
  new: 'New',
  myOrders: 'My Orders',
  admin: 'Admin',
  adminDashboard: 'Admin Dashboard',
  signIn: 'Sign In',
  signOut: 'Sign Out'
}

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => messages[key] || key,
}))

vi.mock('lucide-react', () => ({
  Menu: () => <div data-testid="menu-icon">Menu</div>,
  X: () => <div data-testid="close-icon">X</div>,
  ShoppingBag: () => <div data-testid="cart-icon">Cart</div>,
  User: () => <div data-testid="user-icon">User</div>,
  LogOut: () => <div data-testid="logout-icon">Logout</div>,
  Search: () => <div data-testid="search-icon">Search</div>,
}))

vi.mock('./LanguageSwitcher', () => ({
  LanguageSwitcher: () => <div data-testid="language-switcher">Lang</div>,
}))

vi.mock('@/app/[locale]/(shop)/login/actions', () => ({
  logout: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => ({ get: vi.fn() }),
  usePathname: () => '/',
}))

describe('MobileNav', () => {
  it('renders menu button initially closed', () => {
    render(<MobileNav user={null} />)
    expect(screen.getByLabelText('Toggle menu')).toBeInTheDocument()
    expect(screen.getByTestId('menu-icon')).toBeInTheDocument()
    expect(screen.queryByText('Home')).not.toBeInTheDocument()
  })

  it('opens menu when toggled', () => {
    render(<MobileNav user={null} />)
    const toggleButton = screen.getByLabelText('Toggle menu')
    fireEvent.click(toggleButton)
    
    expect(screen.getByTestId('close-icon')).toBeInTheDocument()
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Gallery')).toBeInTheDocument()
    expect(screen.getByText('Sign In')).toBeInTheDocument()
  })

  it('shows user links when authenticated', () => {
    const user = { email: 'test@example.com', role: 'customer' }
    render(<MobileNav user={user} />)
    
    fireEvent.click(screen.getByLabelText('Toggle menu'))
    
    expect(screen.getByText('My Orders')).toBeInTheDocument()
    expect(screen.getByText('test@example.com')).toBeInTheDocument()
    expect(screen.getByText('Sign Out')).toBeInTheDocument()
    expect(screen.queryByText('Admin Dashboard')).not.toBeInTheDocument()
  })

  it('shows admin link when user is admin', () => {
    const user = { email: 'admin@example.com', role: 'admin' }
    render(<MobileNav user={user} />)
    
    fireEvent.click(screen.getByLabelText('Toggle menu'))
    
    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument()
  })

  it('closes menu when a link is clicked', () => {
    render(<MobileNav user={null} />)
    
    fireEvent.click(screen.getByLabelText('Toggle menu'))
    expect(screen.getByText('Home')).toBeInTheDocument()
    
    fireEvent.click(screen.getByText('Home'))
    
    expect(screen.queryByText('Home')).not.toBeInTheDocument()
  })
})