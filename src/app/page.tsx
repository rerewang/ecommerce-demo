import { getProducts } from '@/services/products'
import { ProductGrid } from '@/components/products/ProductGrid'
import { Header } from '@/components/layout/Header'

export default async function HomePage() {
  const products = await getProducts()
  
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="font-heading text-3xl font-bold text-slate-900 mb-2">
            精选商品
          </h2>
          <p className="text-slate-600">
            优质体验，安心购物
          </p>
        </div>
        
        <ProductGrid products={products} />
      </main>
    </div>
  )
}
