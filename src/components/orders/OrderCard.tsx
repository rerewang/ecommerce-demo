import Link from 'next/link'
import { Order } from '@/types/order'
import { formatCurrency } from '@/lib/utils'
import { OrderStatusBadge } from './OrderStatusBadge'
import Image from 'next/image'
import { useTranslations } from 'next-intl'

interface OrderCardProps {
  order: Order
}

export function OrderCard({ order }: OrderCardProps) {
  const t = useTranslations('Orders')
  // Get the first few items for preview
  const previewItems = order.items.slice(0, 3)
  const remainingCount = order.items.length - 3

  return (
    <Link 
      href={`/orders/${order.id}`}
      className="block bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow duration-200 overflow-hidden"
    >
      <div className="p-4 sm:p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-xs text-slate-500 font-medium mb-1">
              {t('orderNo')} {order.id.slice(0, 8)}...
            </p>
            <p className="text-sm text-slate-500">
              {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString()}
            </p>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>

        <div className="flex gap-4 mb-4 overflow-hidden">
          {previewItems.map((item) => (
            <div key={item.product.id} className="relative w-16 h-16 flex-shrink-0 bg-slate-100 rounded-md overflow-hidden">
              {item.product.image_url ? (
                <Image
                  src={item.product.image_url}
                  alt={item.product.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
                  {t('noImage')}
                </div>
              )}
            </div>
          ))}
          {remainingCount > 0 && (
            <div className="w-16 h-16 flex-shrink-0 bg-slate-50 rounded-md flex items-center justify-center text-slate-500 text-xs font-medium border border-slate-100">
              +{remainingCount}
            </div>
          )}
        </div>

        <div className="flex justify-between items-end border-t border-slate-100 pt-4">
          <div className="text-sm text-slate-600">
            {t('totalItems', { count: order.items.reduce((acc, item) => acc + item.quantity, 0) })}
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500 mb-1">{t('totalPaid')}</p>
            <p className="text-lg font-bold text-slate-900">{formatCurrency(order.total)}</p>
          </div>
        </div>
      </div>
    </Link>
  )
}
