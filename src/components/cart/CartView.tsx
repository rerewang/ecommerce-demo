'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { Button } from '../ui/Button'
import { useCartStore } from '@/store/cart'
import { formatCurrency } from '@/lib/utils'
import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'

export function CartView() {
  const t = useTranslations('Cart')
  const [mounted, setMounted] = useState(false)
  const { items, removeItem, updateQuantity, getTotalPrice } = useCartStore()

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-400">{t('loading')}</p>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-slate-100">
        <div className="max-w-md mx-auto">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-heading font-bold text-slate-900 mb-2">{t('empty')}</h2>
          <p className="text-slate-600 mb-6">{t('emptyDesc')}</p>
          <Link href="/">
            <Button>{t('continueShopping')}</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="divide-y divide-slate-100">
          {items.map(({ product, quantity }) => (
            <div key={product.id} className="p-6 hover:bg-slate-50 transition-colors">
              <div className="flex gap-4">
                <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-slate-100">
                  <Image
                    src={product.image_url}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-heading font-semibold text-slate-900 mb-1">{product.name}</h3>
                  <p className="text-slate-600 text-sm mb-2 line-clamp-2">{product.description}</p>
                  <div className="flex items-center gap-4">
                    <span className="font-heading font-bold text-primary-600">
                      {formatCurrency(product.price)}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <button
                    onClick={() => removeItem(product.id)}
                    className="text-slate-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-lg"
                    aria-label={t('removeItem')}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>

                  <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1">
                    <button
                      onClick={() => updateQuantity(product.id, Math.max(1, quantity - 1))}
                      className="p-1 hover:bg-white rounded transition-colors"
                      aria-label={t('decreaseQuantity')}
                    >
                      <Minus className="w-4 h-4 text-slate-600" />
                    </button>
                    <span className="w-8 text-center font-medium text-slate-900">{quantity}</span>
                    <button
                      onClick={() => updateQuantity(product.id, quantity + 1)}
                      className="p-1 hover:bg-white rounded transition-colors"
                      aria-label={t('increaseQuantity')}
                    >
                      <Plus className="w-4 h-4 text-slate-600" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <span className="text-lg font-heading font-semibold text-slate-900">{t('total')}:</span>
          <span className="text-2xl font-heading font-bold text-primary-600">
            {formatCurrency(getTotalPrice())}
          </span>
        </div>
        <Link href="/checkout" className="block">
          <Button className="w-full">{t('checkout')}</Button>
        </Link>
      </div>
    </div>
  )
}
