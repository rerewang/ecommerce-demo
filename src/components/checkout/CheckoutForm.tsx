'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/store/cart'
import { useCheckoutStore } from '@/store/checkout'
import { updateOrderStatus } from '@/services/orders'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { formatCurrency } from '@/lib/utils'
import { CreditCard, Smartphone, QrCode } from 'lucide-react'
import { createClientComponentClient } from '@/lib/supabase'
import type { CreateOrderInput } from '@/types/order'
import { useTranslations } from 'next-intl'

type PaymentMethod = 'alipay' | 'wechat' | 'card'

export interface CheckoutFormProps {
  userId: string
  source?: string
}

export function CheckoutForm({ userId, source }: CheckoutFormProps) {
  const t = useTranslations('Checkout')
  const router = useRouter()
  const cartStore = useCartStore()
  const checkoutStore = useCheckoutStore()
  
  const isDirectBuy = source === 'direct'
  const directItem = checkoutStore.directBuyItem

  const items = isDirectBuy && directItem
    ? [{ product: directItem.product, quantity: directItem.quantity }]
    : cartStore.items
    
  const total = isDirectBuy && directItem
    ? directItem.product.price * directItem.quantity
    : cartStore.getTotalPrice()

  const [loading, setLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('alipay')
  const [processingStep, setProcessingStep] = useState<'idle' | 'creating_order' | 'processing_payment'>('idle')


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
      
      if (isDirectBuy) {
        checkoutStore.setDirectBuyItem(null)
      } else {
        cartStore.clearCart()
      }
      router.refresh() // Ensure server components have latest data/session
      router.push(`/orders/${orderData.id}`)
    } catch (error) {
      console.error('Checkout error:', error)
      const message = error instanceof Error ? error.message : t('error')
      alert(message)
      setProcessingStep('idle')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return <div className="p-8 text-center text-slate-600">{t('emptyCart')}</div>
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-8">
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-slate-900">{t('shipping')}</h3>
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
            {t('form.name')}
          </label>
          <Input id="name" name="name" required placeholder={t('form.namePlaceholder')} />
        </div>
        
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-slate-700 mb-1">
            {t('form.address')}
          </label>
          <Input id="address" name="address" required placeholder={t('form.addressPlaceholder')} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-slate-700 mb-1">
              {t('form.city')}
            </label>
            <Input id="city" name="city" required placeholder={t('form.cityPlaceholder')} />
          </div>
          <div>
            <label htmlFor="zip" className="block text-sm font-medium text-slate-700 mb-1">
              {t('form.zip')}
            </label>
            <Input id="zip" name="zip" required placeholder={t('form.zipPlaceholder')} />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-slate-900">{t('payment')}</h3>
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
            <span className="text-sm font-medium">{t('paymentMethods.alipay')}</span>
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
            <span className="text-sm font-medium">{t('paymentMethods.wechat')}</span>
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
            <span className="text-sm font-medium">{t('paymentMethods.card')}</span>
          </button>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-200">
        <div className="flex justify-between mb-4 text-lg font-bold">
          <span>{t('total')}</span>
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
              {processingStep === 'creating_order' ? t('creatingOrder') : t('paying')}
            </span>
          ) : (
            t('pay', { amount: formatCurrency(total) })
          )}
        </Button>
      </div>
    </form>
  )
}
