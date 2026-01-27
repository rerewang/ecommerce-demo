import { OrderStatus } from '@/types/order'
import { useTranslations } from 'next-intl'

interface OrderStatusBadgeProps {
  status: OrderStatus
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const t = useTranslations('Orders.status')
  const styles = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    paid: 'bg-green-100 text-green-800 border-green-200',
    shipped: 'bg-blue-100 text-blue-800 border-blue-200',
    cancelled: 'bg-red-100 text-red-800 border-red-200',
  }

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status]}`}>
      {t(status)}
    </span>
  )
}
