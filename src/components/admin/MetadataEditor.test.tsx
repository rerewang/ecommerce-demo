import { render, screen, fireEvent } from '@testing-library/react'
import { MetadataEditor } from './MetadataEditor'
import { test, expect } from 'vitest'
import { useState } from 'react'
import { ProductMetadata } from '@/types/product'

function TestWrapper() {
  const [value, setValue] = useState<ProductMetadata>({})
  return <MetadataEditor value={value} onChange={setValue} />
}

test('adds a new feature', () => {
  render(<TestWrapper />)
  
  fireEvent.click(screen.getByText('添加属性'))
  
  // Expect inputs to appear (2 textboxes per feature: key and value)
  expect(screen.getAllByRole('textbox')).toHaveLength(2)
})
