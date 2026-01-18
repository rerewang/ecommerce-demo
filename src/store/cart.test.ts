import { describe, it, expect, beforeEach } from 'vitest'
import { useCartStore } from './cart'
import type { Product } from '@/types/product'

const mockProduct1: Product = {
  id: '1',
  name: 'Test Product 1',
  description: 'Description 1',
  price: 100,
  image_url: 'image1.jpg',
  stock: 10,
  category: 'Test',
  created_at: '2024-01-01'
}

const mockProduct2: Product = {
  id: '2',
  name: 'Test Product 2',
  description: 'Description 2',
  price: 200,
  image_url: 'image2.jpg',
  stock: 5,
  category: 'Test',
  created_at: '2024-01-01'
}

describe('Cart Store', () => {
  beforeEach(() => {
    useCartStore.getState().clearCart()
    useCartStore.persist.clearStorage()
  })

  describe('addItem', () => {
    it('should add new item to empty cart', () => {
      useCartStore.getState().addItem(mockProduct1, 2)
      
      const items = useCartStore.getState().items
      expect(items).toHaveLength(1)
      expect(items[0].product.id).toBe('1')
      expect(items[0].quantity).toBe(2)
    })

    it('should increase quantity if item already exists', () => {
      useCartStore.getState().addItem(mockProduct1, 1)
      useCartStore.getState().addItem(mockProduct1, 2)
      
      const items = useCartStore.getState().items
      expect(items).toHaveLength(1)
      expect(items[0].quantity).toBe(3)
    })

    it('should add item with default quantity 1 if not specified', () => {
      useCartStore.getState().addItem(mockProduct1)
      
      const items = useCartStore.getState().items
      expect(items[0].quantity).toBe(1)
    })

    it('should add multiple different items', () => {
      useCartStore.getState().addItem(mockProduct1, 2)
      useCartStore.getState().addItem(mockProduct2, 3)
      
      const items = useCartStore.getState().items
      expect(items).toHaveLength(2)
      expect(items[0].product.id).toBe('1')
      expect(items[1].product.id).toBe('2')
    })
  })

  describe('removeItem', () => {
    it('should remove item from cart', () => {
      useCartStore.getState().addItem(mockProduct1, 2)
      useCartStore.getState().removeItem('1')
      
      const items = useCartStore.getState().items
      expect(items).toHaveLength(0)
    })

    it('should only remove specified item when multiple items exist', () => {
      useCartStore.getState().addItem(mockProduct1, 2)
      useCartStore.getState().addItem(mockProduct2, 3)
      useCartStore.getState().removeItem('1')
      
      const items = useCartStore.getState().items
      expect(items).toHaveLength(1)
      expect(items[0].product.id).toBe('2')
    })

    it('should do nothing if item does not exist', () => {
      useCartStore.getState().addItem(mockProduct1, 2)
      useCartStore.getState().removeItem('nonexistent')
      
      const items = useCartStore.getState().items
      expect(items).toHaveLength(1)
    })
  })

  describe('updateQuantity', () => {
    it('should update item quantity', () => {
      useCartStore.getState().addItem(mockProduct1, 2)
      useCartStore.getState().updateQuantity('1', 5)
      
      const items = useCartStore.getState().items
      expect(items[0].quantity).toBe(5)
    })

    it('should remove item if quantity is 0', () => {
      useCartStore.getState().addItem(mockProduct1, 2)
      useCartStore.getState().updateQuantity('1', 0)
      
      const items = useCartStore.getState().items
      expect(items).toHaveLength(0)
    })

    it('should remove item if quantity is negative', () => {
      useCartStore.getState().addItem(mockProduct1, 2)
      useCartStore.getState().updateQuantity('1', -1)
      
      const items = useCartStore.getState().items
      expect(items).toHaveLength(0)
    })

    it('should only update specified item when multiple items exist', () => {
      useCartStore.getState().addItem(mockProduct1, 2)
      useCartStore.getState().addItem(mockProduct2, 3)
      useCartStore.getState().updateQuantity('1', 10)
      
      const items = useCartStore.getState().items
      expect(items[0].quantity).toBe(10)
      expect(items[1].quantity).toBe(3)
    })
  })

  describe('clearCart', () => {
    it('should remove all items from cart', () => {
      useCartStore.getState().addItem(mockProduct1, 2)
      useCartStore.getState().addItem(mockProduct2, 3)
      useCartStore.getState().clearCart()
      
      const items = useCartStore.getState().items
      expect(items).toHaveLength(0)
    })

    it('should work on already empty cart', () => {
      useCartStore.getState().clearCart()
      
      const items = useCartStore.getState().items
      expect(items).toHaveLength(0)
    })
  })

  describe('getTotalPrice', () => {
    it('should return 0 for empty cart', () => {
      const total = useCartStore.getState().getTotalPrice()
      expect(total).toBe(0)
    })

    it('should calculate total price for single item', () => {
      useCartStore.getState().addItem(mockProduct1, 2)
      
      const total = useCartStore.getState().getTotalPrice()
      expect(total).toBe(200)
    })

    it('should calculate total price for multiple items', () => {
      useCartStore.getState().addItem(mockProduct1, 2)
      useCartStore.getState().addItem(mockProduct2, 3)
      
      const total = useCartStore.getState().getTotalPrice()
      expect(total).toBe(800)
    })
  })

  describe('getTotalItems', () => {
    it('should return 0 for empty cart', () => {
      const total = useCartStore.getState().getTotalItems()
      expect(total).toBe(0)
    })

    it('should count total quantity for single item', () => {
      useCartStore.getState().addItem(mockProduct1, 3)
      
      const total = useCartStore.getState().getTotalItems()
      expect(total).toBe(3)
    })

    it('should count total quantity for multiple items', () => {
      useCartStore.getState().addItem(mockProduct1, 2)
      useCartStore.getState().addItem(mockProduct2, 3)
      
      const total = useCartStore.getState().getTotalItems()
      expect(total).toBe(5)
    })
  })
})
