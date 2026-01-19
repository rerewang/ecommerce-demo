import { getProducts } from '@/services/products'
import { ProductGrid } from '@/components/products/ProductGrid'
import { Header } from '@/components/layout/Header'
import { ProductFilterContainer } from '@/components/products/ProductFilterContainer'
import type { ProductFilter } from '@/types/product'

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function HomePage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams
  
  const filter: ProductFilter = {
    query: typeof resolvedParams.q === 'string' ? resolvedParams.q : undefined,
    category: typeof resolvedParams.category === 'string' ? resolvedParams.category : undefined,
    sort: typeof resolvedParams.sort === 'string' ? (resolvedParams.sort as ProductFilter['sort']) : undefined
  }

  const products = await getProducts(filter)
  
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="font-heading text-3xl font-bold text-slate-900 mb-2">
            精选商品
          </h2>
          <p className="text-slate-600 mb-6">
            优质体验，安心购物
          </p>
          
          <ProductFilterContainer />
        </div>
        
        <ProductGrid products={products} />
      </main>
    </div>
  )
}
