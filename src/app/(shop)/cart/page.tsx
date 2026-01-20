import { CartView } from '@/components/cart/CartView'

export default function CartPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="font-heading text-3xl font-bold text-slate-900 mb-8">
          购物车
        </h1>
        
        <CartView />
      </main>
    </div>
  )
}
