import { createServerClient } from '@/lib/supabase-server'
import { getUserOrders } from '@/services/orders'
import { redirect } from 'next/navigation'
import { OrderCard } from '@/components/orders/OrderCard'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default async function OrdersPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login?redirect=/orders')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile) {
    redirect('/login?redirect=/orders')
  }

  const orders = await getUserOrders(user.id, profile.role)

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">我的订单</h1>
      <div className="max-w-3xl mx-auto">
        {orders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">暂无订单</h3>
            <p className="text-slate-500 mb-6">你还没有购买过商品，快去挑选心仪的商品吧</p>
            <Link href="/">
              <Button>去逛逛</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
