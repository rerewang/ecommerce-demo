import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Product } from '@/types/product'

interface DirectBuyItem {
  product: Product
  quantity: number
  variants?: Record<string, string>
}

interface CheckoutState {
  directBuyItem: DirectBuyItem | null
  setDirectBuyItem: (item: DirectBuyItem | null) => void
}

export const useCheckoutStore = create<CheckoutState>()(
  persist(
    (set) => ({
      directBuyItem: null,
      setDirectBuyItem: (item) => set({ directBuyItem: item }),
    }),
    { name: 'checkout-storage' }
  )
)
