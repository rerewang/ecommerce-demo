import { Header } from '@/components/layout/Header'
import { OrdersTable } from '@/components/admin/OrdersTable'
import { getOrders } from '@/services/orders'
import { createServerClient } from '@/lib/supabase-server'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { OrderStatus } from '@/types/order'
import { redirect } from 'next/navigation'

interface AdminOrdersPageProps {
  searchParams: Promise<{ status?: string }>
}

export default async function AdminOrdersPage({ searchParams }: AdminOrdersPageProps) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login?redirect=/admin/orders')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    redirect('/')
  }

  const { status } = await searchParams
  const validStatus = ['pending', 'paid', 'shipped', 'cancelled'].includes(status || '') 
    ? (status as OrderStatus) 
    : undefined
    
  const orders = await getOrders(user.id, profile.role, validStatus)

  const tabs = [
    { label: '全部', value: undefined },
    { label: '待支付', value: 'pending' },
    { label: '已支付', value: 'paid' },
    { label: '已发货', value: 'shipped' },
    { label: '已取消', value: 'cancelled' },
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-heading text-3xl font-bold text-slate-900 mb-2">
              订单管理
            </h1>
            <div className="flex gap-4 text-sm">
              <Link href="/admin" className="text-slate-500 hover:text-slate-900">
                商品管理
              </Link>
              <span className="text-slate-900 font-medium border-b-2 border-slate-900">
                订单管理
              </span>
            </div>
          </div>
        </div>

        <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
          {tabs.map((tab) => {
            const isActive = validStatus === tab.value
            return (
              <Link
                key={tab.label}
                href={tab.value ? `/admin/orders?status=${tab.value}` : '/admin/orders'}
              >
                <Button
                  variant={isActive ? 'primary' : 'outline'}
                  size="sm"
                  className={!isActive ? 'bg-white' : ''}
                >
                  {tab.label}
                </Button>
              </Link>
            )
          })}
        </div>
        
        <OrdersTable orders={orders} />
      </main>
    </div>
  )
}
