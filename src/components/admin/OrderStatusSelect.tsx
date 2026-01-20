'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateOrderStatus } from '@/services/orders'
import type { OrderStatus } from '@/types/order'

interface Props {
  orderId: string
  currentStatus: string
}

export function OrderStatusSelect({ orderId, currentStatus }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as OrderStatus
    if (newStatus === currentStatus) return

    if (!confirm('确定要修改订单状态吗？')) {
        e.target.value = currentStatus
        return
    }

    setLoading(true)
    try {
      await updateOrderStatus(orderId, newStatus)
      router.refresh()
    } catch (error) {
      console.error('Failed to update status', error)
      alert('更新失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <select 
      value={currentStatus} 
      onChange={handleChange}
      disabled={loading}
      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:max-w-xs sm:text-sm sm:leading-6"
    >
      <option value="pending">待支付</option>
      <option value="paid">已支付</option>
      <option value="shipped">已发货</option>
      <option value="completed">已完成</option>
      <option value="cancelled">已取消</option>
    </select>
  )
}
