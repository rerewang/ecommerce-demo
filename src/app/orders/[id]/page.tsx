import { OrderDetail } from '@/components/orders/OrderDetail'
import { getOrderById } from '@/services/orders'
import { createServerClient } from '@/lib/supabase-server'

interface OrderPageProps {
  params: Promise<{ id: string }>
}

export default async function OrderPage({ params }: OrderPageProps) {
  const { id } = await params
  
  const supabase = await createServerClient()
  const order = await getOrderById(id, supabase)

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <OrderDetail orderId={id} initialOrder={order} />
    </div>
  )
}
