'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/store/cart'
import { createOrder } from '@/services/orders'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { formatCurrency } from '@/lib/utils'

export function CheckoutForm() {
  const router = useRouter()
  const { items, getTotalPrice, clearCart } = useCartStore()
  const [loading, setLoading] = useState(false)
  
  const total = getTotalPrice()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    
    try {
      await createOrder({
        items,
        total,
        shippingAddress: {
          name: formData.get('name') as string,
          address: formData.get('address') as string,
          city: formData.get('city') as string,
          zip: formData.get('zip') as string,
        }
      })
      
      clearCart()
      alert('订单创建成功！')
      router.push('/')
    } catch {
      alert('下单失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return <div>购物车为空</div>
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-6">
      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
            姓名
          </label>
          <Input id="name" name="name" required placeholder="收货人姓名" />
        </div>
        
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-slate-700 mb-1">
            地址
          </label>
          <Input id="address" name="address" required placeholder="详细地址" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-slate-700 mb-1">
              城市
            </label>
            <Input id="city" name="city" required placeholder="城市" />
          </div>
          <div>
            <label htmlFor="zip" className="block text-sm font-medium text-slate-700 mb-1">
              邮编
            </label>
            <Input id="zip" name="zip" required placeholder="000000" />
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-200">
        <div className="flex justify-between mb-4 text-lg font-bold">
          <span>总计</span>
          <span>{formatCurrency(total)}</span>
        </div>
        
        <Button 
          type="submit" 
          className="w-full" 
          size="lg"
          disabled={loading}
        >
          {loading ? '处理中...' : `支付 ${formatCurrency(total)}`}
        </Button>
      </div>
    </form>
  )
}
