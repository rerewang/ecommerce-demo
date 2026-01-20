import { render, screen, fireEvent } from '@testing-library/react'
import { MetadataEditor } from './MetadataEditor'
import { test, expect } from 'vitest'
import { useState } from 'react'
import { ProductMetadata } from '@/types/product'

function TestWrapper() {
  const [value, setValue] = useState<ProductMetadata>({ features: {} })
  return <MetadataEditor value={value} onChange={setValue} />
}

test('adds a new feature row', () => {
  render(<TestWrapper />)
  
  const addBtn = screen.getByText('Add Feature')
  fireEvent.click(addBtn)
  
  expect(screen.getAllByPlaceholderText(/Name/)).toHaveLength(1)
  expect(screen.getAllByPlaceholderText(/Value/)).toHaveLength(1)
})
