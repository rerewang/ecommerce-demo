import { render, screen, fireEvent, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ProductFilterBar } from './ProductFilterBar'

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      'searchPlaceholder': 'search products',
      'categoryLabel': 'category',
      'allCategories': 'All Categories',
      'sortLabel': 'sort',
      'sortNewest': 'Newest',
      'sortPriceLow': 'Price: Low to High',
      'sortPriceHigh': 'Price: High to Low'
    }
    return translations[key] || key
  }
}))

describe('ProductFilterBar', () => {
  const mockOnFilterChange = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  it('renders filter controls', () => {
    render(<ProductFilterBar onFilterChange={mockOnFilterChange} />)
    
    expect(screen.getByPlaceholderText(/search products/i)).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: /category/i })).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: /sort/i })).toBeInTheDocument()
  })

  it('debounces search input', async () => {
    render(<ProductFilterBar onFilterChange={mockOnFilterChange} />)
    
    const input = screen.getByPlaceholderText(/search products/i)
    fireEvent.change(input, { target: { value: 'phone' } })

    // Should not call immediately
    expect(mockOnFilterChange).not.toHaveBeenCalled()

    // Advance timer
    act(() => {
      vi.advanceTimersByTime(300)
    })

    expect(mockOnFilterChange).toHaveBeenCalledWith(expect.objectContaining({
      query: 'phone'
    }))
  })

  it('updates category immediately', () => {
    render(<ProductFilterBar onFilterChange={mockOnFilterChange} />)
    
    const select = screen.getByRole('combobox', { name: /category/i })
    fireEvent.change(select, { target: { value: 'Electronics' } })

    expect(mockOnFilterChange).toHaveBeenCalledWith(expect.objectContaining({
      category: 'Electronics'
    }))
  })

  it('updates sort immediately', () => {
    render(<ProductFilterBar onFilterChange={mockOnFilterChange} />)
    
    const select = screen.getByRole('combobox', { name: /sort/i })
    fireEvent.change(select, { target: { value: 'price_asc' } })

    expect(mockOnFilterChange).toHaveBeenCalledWith(expect.objectContaining({
      sort: 'price_asc'
    }))
  })
})
