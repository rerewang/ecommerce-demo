import { describe, it, expect, beforeEach } from 'vitest'
import { useCheckoutStore } from './checkout'
import type { Product } from '@/types/product'

describe('Checkout Store', () => {
  beforeEach(() => {
    useCheckoutStore.setState({ directBuyItem: null })
  })

  it('sets direct buy item', () => {
    const product = { 
      id: '1', 
      name: 'Test', 
      price: 100, 
      description: 'Test Desc',
      image_url: 'test.jpg',
      stock: 10,
      category: 'Test',
      created_at: '2024-01-01'
    } satisfies Product
    
    const item = { product, quantity: 1, variants: { Color: 'Red' } }
    useCheckoutStore.getState().setDirectBuyItem(item)
    
    expect(useCheckoutStore.getState().directBuyItem).toEqual(item)
  })
})
