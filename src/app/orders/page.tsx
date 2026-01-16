import { OrderList } from '@/components/orders/OrderList'

export default function OrdersPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">我的订单</h1>
      <div className="max-w-3xl mx-auto">
        <OrderList />
      </div>
    </div>
  )
}
