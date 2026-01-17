'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Package, MapPin, Calendar, CreditCard } from 'lucide-react'
import { getOrderById } from '@/services/orders'
import { createClientComponentClient } from '@/lib/supabase'
import { Order } from '@/types/order'
import { formatCurrency } from '@/lib/utils'
import { OrderStatusBadge } from './OrderStatusBadge'
import { Button } from '@/components/ui/Button'

interface OrderDetailProps {
  orderId: string
  initialOrder?: Order | null
}

export function OrderDetail({ orderId, initialOrder }: OrderDetailProps) {
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(initialOrder || null)
  const [loading, setLoading] = useState(!initialOrder)

  useEffect(() => {
    if (initialOrder) return

    const fetchOrder = async () => {
      try {
        const supabase = createClientComponentClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push(`/login?redirect=/orders/${orderId}`)
          return
        }

        const data = await getOrderById(orderId)
        if (!data) {
          // Handle 404
          return
        }
        
        // Security check: ensure order belongs to user (also handled by RLS)
        if (data.userId !== user.id) {
          router.push('/orders')
          return
        }

        setOrder(data)
      } catch (error) {
        console.error('Failed to fetch order:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [orderId, router])

  if (loading) {
    return <div className="animate-pulse h-96 bg-slate-100 rounded-xl" />
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold text-slate-900 mb-2">订单未找到</h2>
        <Link href="/orders">
          <Button variant="secondary">返回订单列表</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/orders" className="text-slate-500 hover:text-slate-900 transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            订单详情
          </h1>
          <p className="text-sm text-slate-500">
            订单号: {order.id}
          </p>
        </div>
        <div className="ml-auto">
          <OrderStatusBadge status={order.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
              <Package className="w-5 h-5 text-slate-500" />
              <h3 className="font-medium text-slate-900">商品清单</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {order.items.map((item) => (
                <div key={item.id} className="p-4 flex gap-4">
                  <div className="relative w-20 h-20 bg-slate-100 rounded-lg flex-shrink-0 overflow-hidden">
                    {item.product?.image_url ? (
                      <Image
                        src={item.product.image_url}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
                        无图
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-slate-900 truncate">
                      {item.product?.name}
                    </h4>
                    <p className="text-sm text-slate-500 mb-1">
                      {item.product?.category}
                    </p>
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-sm text-slate-600">
                        数量: {item.quantity}
                      </p>
                      <p className="font-medium text-slate-900">
                        {formatCurrency(item.product.price)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Shipping Info */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-slate-500" />
              <h3 className="font-medium text-slate-900">收货信息</h3>
            </div>
            <div className="p-4 space-y-3 text-sm">
              <div>
                <span className="block text-slate-500 text-xs">收货人</span>
                <span className="font-medium text-slate-900">{order.shippingAddress.name}</span>
              </div>
              <div>
                <span className="block text-slate-500 text-xs">地址</span>
                <span className="font-medium text-slate-900">
                  {order.shippingAddress.city} {order.shippingAddress.zip}<br />
                  {order.shippingAddress.address}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-slate-500" />
              <h3 className="font-medium text-slate-900">支付明细</h3>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">商品总额</span>
                <span className="font-medium">{formatCurrency(order.total)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">运费</span>
                <span className="text-green-600 font-medium">免运费</span>
              </div>
              <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                <span className="font-bold text-slate-900">实付金额</span>
                <span className="text-xl font-bold text-slate-900">{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
             <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-slate-500" />
              <h3 className="font-medium text-slate-900">订单时间</h3>
            </div>
            <div className="p-4 space-y-2 text-sm text-slate-600">
              <div className="flex justify-between">
                <span>下单时间</span>
                <span>{new Date(order.createdAt).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>最近更新</span>
                <span>{new Date(order.updatedAt).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
