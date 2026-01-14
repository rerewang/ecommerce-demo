import { CheckoutForm } from '@/components/checkout/CheckoutForm'
import { Header } from '@/components/layout/Header'

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="font-heading text-3xl font-bold text-slate-900 mb-8 text-center">
          填写订单信息
        </h1>
        
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 max-w-2xl mx-auto">
          <CheckoutForm />
        </div>
      </main>
    </div>
  )
}
