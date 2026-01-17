import { OrderDetail } from '@/components/orders/OrderDetail'
import { getOrderById } from '@/services/orders'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

interface OrderPageProps {
  params: Promise<{ id: string }>
}

export default async function OrderPage({ params }: OrderPageProps) {
  const { id } = await params
  
  // Fetch order data server-side
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
  
  const order = await getOrderById(id, supabase)

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <OrderDetail orderId={id} initialOrder={order} />
    </div>
  )
}
