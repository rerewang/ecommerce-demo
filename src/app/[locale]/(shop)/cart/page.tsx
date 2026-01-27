import { CartView } from '@/components/cart/CartView'
import { getTranslations } from 'next-intl/server'

export default async function CartPage() {
  const t = await getTranslations('Cart')
  return (
    <div className="min-h-screen bg-slate-50">
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="font-heading text-3xl font-bold text-slate-900 mb-8">
          {t('title')}
        </h1>
        
        <CartView />
      </main>
    </div>
  )
}
