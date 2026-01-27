import { render, screen } from '@testing-library/react'
import { Hero } from './Hero'
import { describe, it, expect, vi } from 'vitest'

vi.mock('lucide-react', () => ({
  Check: () => <div data-testid="check-icon">Check</div>,
}))

const mockProps = {
  title: <span>Masterpieces of Your Pet</span>,
  subtitle: "Museum-quality AI portraits, generated instantly.",
  cta: "Create Your Art",
  features: {
    instant: "Instant Generation",
    quality: "Museum Quality",
    unique: "100% Unique"
  }
}

describe('Hero', () => {
  it('renders the hero section with updated headline', () => {
    render(<Hero {...mockProps} />)
    
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Masterpieces of Your Pet/i)
    expect(screen.getByText(/Museum-quality AI portraits, generated instantly/i)).toBeInTheDocument()
  })

  it('renders all three benefit bullets', () => {
    render(<Hero {...mockProps} />)
    
    expect(screen.getByText('Instant Generation')).toBeInTheDocument()
    expect(screen.getByText('Museum Quality')).toBeInTheDocument()
    expect(screen.getByText('100% Unique')).toBeInTheDocument()
    
    const icons = screen.getAllByTestId('check-icon')
    expect(icons).toHaveLength(3)
  })

  it('renders the CTA button with correct link', () => {
    render(<Hero {...mockProps} />)
    
    const link = screen.getByRole('link', { name: /Create Your Art/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/products')
    
    const button = screen.getByRole('button', { name: /Create Your Art/i })
    expect(button).toBeInTheDocument()
    expect(button).toHaveClass('rounded-xl')
  })
})