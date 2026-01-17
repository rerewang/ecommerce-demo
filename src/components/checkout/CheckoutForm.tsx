'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/store/cart'
import { updateOrderStatus } from '@/services/orders'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { formatCurrency } from '@/lib/utils'
import { CreditCard, Smartphone, QrCode } from 'lucide-react'
import { createClientComponentClient } from '@/lib/supabase'
import type { CreateOrderInput } from '@/types/order'

type PaymentMethod = 'alipay' | 'wechat' | 'card'

export interface CheckoutFormProps {
  userId: string
}

export function CheckoutForm({ userId }: CheckoutFormProps) {
  const router = useRouter()
  const { items, getTotalPrice, clearCart } = useCartStore()
  const [loading, setLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('alipay')
  const [processingStep, setProcessingStep] = useState<'idle' | 'creating_order' | 'processing_payment'>('idle')
  
  const total = getTotalPrice()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setProcessingStep('creating_order')

    const formData = new FormData(e.currentTarget)
    
    try {
      // Create client-side Supabase instance with user session
      const supabase = createClientComponentClient()

      // 1. Create Order
      const orderInput: CreateOrderInput = {
        items,
        total,
        shippingAddress: {
          name: formData.get('name') as string,
          address: formData.get('address') as string,
          city: formData.get('city') as string,
          zip: formData.get('zip') as string,
        }
      }

      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: userId,
          total: orderInput.total,
          status: 'pending',
          shipping_address: orderInput.shippingAddress
        })
        .select()
        .single()

      if (orderError) throw new Error(`Failed to create order: ${orderError.message}`)
      if (!orderData) throw new Error('Failed to create order: No data returned')

      // 2. Create order items
      const orderItems = orderInput.items.map(item => ({
        order_id: orderData.id,
        product_id: item.product.id,
        quantity: item.quantity,
        price_at_purchase: item.product.price
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) {
        throw new Error(`Failed to create order items: ${itemsError.message}`)
      }

      // 3. Decrement stock for each item
      for (const item of orderInput.items) {
        const { error: stockError } = await supabase.rpc('decrement_stock', {
          product_id: item.product.id,
          quantity: item.quantity
        })

        if (stockError) {
          console.error(`Failed to decrement stock for item ${item.product.id}:`, stockError)
        }
      }

      // 4. Simulate Payment
      setProcessingStep('processing_payment')
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // 5. Update Order Status
      await updateOrderStatus(orderData.id, 'paid')
      
      clearCart()
      router.push(`/orders/${orderData.id}`)
    } catch (error) {
      console.error('Checkout error:', error)
      const message = error instanceof Error ? error.message : '下单失败，请重试'
      alert(message)
      setProcessingStep('idle')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return <div className="p-8 text-center text-slate-600">购物车为空，去挑选一些商品吧</div>
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-8">
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-slate-900">收货信息</h3>
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

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-slate-900">支付方式</h3>
        <div className="grid grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => setPaymentMethod('alipay')}
            className={`flex flex-col items-center justify-center p-3 border rounded-xl transition-all ${
              paymentMethod === 'alipay' 
                ? 'border-blue-500 bg-blue-50 text-blue-700' 
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <Smartphone className="w-6 h-6 mb-2" />
            <span className="text-sm font-medium">支付宝</span>
          </button>
          <button
            type="button"
            onClick={() => setPaymentMethod('wechat')}
            className={`flex flex-col items-center justify-center p-3 border rounded-xl transition-all ${
              paymentMethod === 'wechat' 
                ? 'border-green-500 bg-green-50 text-green-700' 
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <QrCode className="w-6 h-6 mb-2" />
            <span className="text-sm font-medium">微信支付</span>
          </button>
          <button
            type="button"
            onClick={() => setPaymentMethod('card')}
            className={`flex flex-col items-center justify-center p-3 border rounded-xl transition-all ${
              paymentMethod === 'card' 
                ? 'border-purple-500 bg-purple-50 text-purple-700' 
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <CreditCard className="w-6 h-6 mb-2" />
            <span className="text-sm font-medium">信用卡</span>
          </button>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-200">
        <div className="flex justify-between mb-4 text-lg font-bold">
          <span>总计</span>
          <span>{formatCurrency(total)}</span>
        </div>
        
        <Button 
          type="submit" 
          className="w-full relative overflow-hidden" 
          size="lg"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {processingStep === 'creating_order' ? '创建订单中...' : '正在支付...'}
            </span>
          ) : (
            `支付 ${formatCurrency(total)}`
          )}
        </Button>
      </div>
    </form>
  )
}
