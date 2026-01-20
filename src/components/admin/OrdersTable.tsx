import { Order } from '@/types/order'
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge'
import { OrderStatusSelect } from './OrderStatusSelect'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'

interface OrdersTableProps {
  orders: Order[]
}

export function OrdersTable({ orders }: OrdersTableProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 font-medium">
            <tr>
              <th className="px-4 py-3">订单号</th>
              <th className="px-4 py-3">用户ID</th>
              <th className="px-4 py-3">金额</th>
              <th className="px-4 py-3">状态</th>
              <th className="px-4 py-3">时间</th>
              <th className="px-4 py-3 text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">
                  <Link href={`/orders/${order.id}`} className="hover:underline">
                    {order.id.slice(0, 8)}...
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-500 font-mono text-xs">
                  {order.userId.slice(0, 8)}...
                </td>
                <td className="px-4 py-3 font-medium">
                  {formatCurrency(order.total)}
                </td>
                <td className="px-4 py-3">
                  <OrderStatusBadge status={order.status} />
                </td>
                <td className="px-4 py-3 text-slate-500">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-right">
                  <OrderStatusSelect orderId={order.id} currentStatus={order.status} />
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                  暂无订单
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
