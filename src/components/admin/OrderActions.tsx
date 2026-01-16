'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateOrderStatus } from '@/services/orders'
import { Button } from '@/components/ui/Button'
import { OrderStatus } from '@/types/order'

interface OrderActionsProps {
  orderId: string
  currentStatus: OrderStatus
}

export function OrderActions({ orderId, currentStatus }: OrderActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState<OrderStatus | null>(null)

  const handleUpdate = async (status: OrderStatus) => {
    setLoading(status)
    try {
      await updateOrderStatus(orderId, status)
      router.refresh()
    } catch (error) {
      console.error('Failed to update status:', error)
      alert('更新状态失败')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="flex gap-2">
      {currentStatus === 'pending' && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleUpdate('paid')}
          disabled={!!loading}
        >
          {loading === 'paid' ? '处理中...' : '标记为已支付'}
        </Button>
      )}
      {currentStatus === 'paid' && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleUpdate('shipped')}
          disabled={!!loading}
        >
          {loading === 'shipped' ? '处理中...' : '标记为已发货'}
        </Button>
      )}
      {(currentStatus === 'pending' || currentStatus === 'paid') && (
        <Button
          variant="ghost"
          size="sm"
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={() => handleUpdate('cancelled')}
          disabled={!!loading}
        >
          {loading === 'cancelled' ? '处理中...' : '取消订单'}
        </Button>
      )}
    </div>
  )
}
