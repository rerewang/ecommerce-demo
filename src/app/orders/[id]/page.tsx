import { OrderDetail } from '@/components/orders/OrderDetail'

interface OrderPageProps {
  params: Promise<{ id: string }>
}

export default async function OrderPage({ params }: OrderPageProps) {
  const { id } = await params

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <OrderDetail orderId={id} />
    </div>
  )
}
