'use client'

import { useState } from 'react'
import { ShoppingCart, Check } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useCartStore } from '@/store/cart'
import type { Product } from '@/types/product'
import { cn } from '@/lib/utils'

export interface AddToCartButtonProps {
  product: Product
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const [added, setAdded] = useState(false)
  const addItem = useCartStore(state => state.addItem)
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addItem(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }
  
  return (
    <Button
      variant="primary"
      size="lg"
      className={cn(
        "w-full transition-all duration-300",
        added && "bg-success hover:bg-success border-success text-white"
      )}
      onClick={handleAddToCart}
      disabled={product.stock === 0}
    >
      {added ? (
        <div className="flex items-center animate-fade-in">
          <Check className="w-5 h-5 mr-2" />
          已添加到购物车
        </div>
      ) : (
        <>
          <ShoppingCart className="w-5 h-5 mr-2" />
          {product.stock > 0 ? '加入购物车' : '已售罄'}
        </>
      )}
    </Button>
  )
}
