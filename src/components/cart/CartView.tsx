'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useCartStore } from '@/store/cart'
import { formatCurrency } from '@/lib/utils'
import { useEffect, useState } from 'react'

export function CartView() {
  const [mounted, setMounted] = useState(false)
  const { items, removeItem, updateQuantity, getTotalPrice } = useCartStore()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Show nothing (or a skeleton) until hydrated to avoid mismatch
  if (!mounted) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-400">正在加载购物车...</p>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-2xl font-heading font-semibold text-slate-900 mb-2">
          购物车空空如也
        </h2>
        <p className="text-slate-500 mb-8">
          看起来你还没有添加任何商品
        </p>
        <Link href="/">
          <Button variant="primary">去逛逛</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-4">
        {items.map((item) => (
          <div
            key={item.product.id}
            className="flex gap-4 p-4 bg-white rounded-xl shadow-sm border border-slate-100 transition-all hover:shadow-md"
          >
            <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 border border-slate-100">
              <Image
                src={item.product.image_url}
                alt={item.product.name}
                fill
                className="object-cover"
              />
            </div>

            <div className="flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-heading font-semibold text-slate-900 line-clamp-1">
                  {item.product.name}
                </h3>
                <p className="text-sm text-slate-500">{item.product.category}</p>
              </div>

              <div className="flex items-center justify-between">
                <p className="font-bold text-primary-600">
                  {formatCurrency(item.product.price)}
                </p>

                <div className="flex items-center gap-3">
                  <div className="flex items-center rounded-lg border border-slate-200">
                    <button
                      className="p-1 hover:bg-slate-100 rounded-l-lg transition-colors"
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                    >
                      <Minus className="w-4 h-4 text-slate-600" />
                    </button>
                    <span className="w-8 text-center text-sm font-medium">
                      {item.quantity}
                    </span>
                    <button
                      className="p-1 hover:bg-slate-100 rounded-r-lg transition-colors"
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                    >
                      <Plus className="w-4 h-4 text-slate-600" />
                    </button>
                  </div>

                  <button
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    onClick={() => removeItem(item.product.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="lg:col-span-1">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 sticky top-24">
          <h3 className="font-heading text-lg font-semibold text-slate-900 mb-4">
            订单摘要
          </h3>
          
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-slate-600">
              <span>小计</span>
              <span>{formatCurrency(getTotalPrice())}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>运费</span>
              <span className="text-success">免费</span>
            </div>
            <div className="pt-3 border-t border-slate-100 flex justify-between font-bold text-lg text-slate-900">
              <span>总计: {formatCurrency(getTotalPrice())}</span>
            </div>
          </div>

          <Link href="/checkout">
            <Button className="w-full" size="lg">
              去结算
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
