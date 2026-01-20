import { render, screen, fireEvent } from '@testing-library/react'
import { MetadataEditor } from './MetadataEditor'
import { test, expect, vi } from 'vitest'
import { useState } from 'react'
import { ProductMetadata } from '@/types/product'

function TestWrapper() {
  const [value, setValue] = useState<ProductMetadata>({ features: {} })
  return <form onSubmit={(e) => { e.preventDefault(); console.log('SUBMITTED') }}><MetadataEditor value={value} onChange={setValue} /></form>
}

test('adds a new feature row', () => {
  render(<TestWrapper />)
  
  const addBtn = screen.getByText('Add Feature')
  fireEvent.click(addBtn)
  
  expect(screen.getAllByPlaceholderText(/Name/)).toHaveLength(1)
  expect(screen.getAllByPlaceholderText(/Value/)).toHaveLength(1)
})

test('switching tabs does not trigger form submission', () => {
  const handleSubmit = vi.fn((e) => e.preventDefault())
  
  render(
    <form onSubmit={handleSubmit}>
      <MetadataEditor value={{}} onChange={() => {}} />
    </form>
  )
  
  const rawTab = screen.getByText('Raw JSON')
  fireEvent.click(rawTab)
  
  expect(handleSubmit).not.toHaveBeenCalled()
})
