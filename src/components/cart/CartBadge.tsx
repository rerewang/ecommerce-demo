'use client'

import { ShoppingCart } from 'lucide-react'
import { useCartStore } from '@/store/cart'
import { useState, useEffect } from 'react'
import { Link } from '@/i18n/routing'

export function CartBadge() {
  const [mounted, setMounted] = useState(false)
  const totalItems = useCartStore(state => state.getTotalItems())
  
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  const displayCount = mounted ? totalItems : 0

  return (
    <Link href="/cart">
      <button className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer active:scale-95 transition-transform duration-100">
        <ShoppingCart className="w-6 h-6 text-slate-700" />
        {displayCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {displayCount > 99 ? '99+' : displayCount}
          </span>
        )}
      </button>
    </Link>
  )
}
