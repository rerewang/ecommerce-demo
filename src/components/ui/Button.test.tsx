import { render, screen } from '@testing-library/react'
import { Button } from './Button'
import { describe, it, expect } from 'vitest'

describe('Button', () => {
  it('renders correctly with default props', () => {
    render(<Button>Click me</Button>)
    const button = screen.getByRole('button', { name: /click me/i })
    expect(button).toBeInTheDocument()
    expect(button).toHaveClass('bg-primary')
  })

  it('renders primary variant correctly', () => {
    render(<Button variant="primary">Primary</Button>)
    const button = screen.getByRole('button', { name: /primary/i })
    expect(button).toHaveClass('bg-primary')
    expect(button).toHaveClass('text-white')
  })

  it('renders secondary variant correctly', () => {
    render(<Button variant="secondary">Secondary</Button>)
    const button = screen.getByRole('button', { name: /secondary/i })
    expect(button).toHaveClass('bg-white/80')
    expect(button).toHaveClass('backdrop-blur-sm')
  })

  it('renders outline variant correctly', () => {
    render(<Button variant="outline">Outline</Button>)
    const button = screen.getByRole('button', { name: /outline/i })
    expect(button).toHaveClass('border-2')
    expect(button).toHaveClass('border-primary')
  })

  it('applies size classes correctly', () => {
    render(<Button size="lg">Large</Button>)
    const button = screen.getByRole('button', { name: /large/i })
    expect(button).toHaveClass('text-lg')
    expect(button).toHaveClass('rounded-full') // Checking for the new rounded-full style
  })
})
