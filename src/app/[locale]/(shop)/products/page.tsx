import { getProducts } from '@/services/products'
import { searchSemanticProductsAction } from '@/app/actions/product-actions'
import { ProductGrid } from '@/components/products/ProductGrid'
import { ProductFilterContainer } from '@/components/products/ProductFilterContainer'
import type { ProductFilter, Product } from '@/types/product'
import { getTranslations } from 'next-intl/server'

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function HomePage({ searchParams }: PageProps) {
  const t = await getTranslations('Products')
  const resolvedParams = await searchParams
  
  const filter: ProductFilter = {
    query: typeof resolvedParams.q === 'string' ? resolvedParams.q : undefined,
    category: typeof resolvedParams.category === 'string' ? resolvedParams.category : undefined,
    sort: typeof resolvedParams.sort === 'string' ? (resolvedParams.sort as ProductFilter['sort']) : undefined
  }

  let products: Product[] = []

  if (filter.query) {
    products = await searchSemanticProductsAction(filter.query)
    
    if (filter.category) {
      products = products.filter(p => p.category === filter.category)
    }

    if (filter.sort) {
      products.sort((a, b) => {
        switch (filter.sort) {
          case 'price_asc': return a.price - b.price
          case 'price_desc': return b.price - a.price
          case 'newest': return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          default: return 0 
        }
      })
    }
  } else {
    products = await getProducts(filter)
  }
  
  return (
    <div className="min-h-screen bg-slate-50">
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="font-heading text-3xl font-bold text-slate-900 mb-2">
            {t('title')}
          </h2>
          <p className="text-slate-600 mb-6">
            {t('subtitle')}
          </p>
          
          <ProductFilterContainer />
        </div>
        
        <ProductGrid products={products} emptyMessage={t('empty')} />
      </main>
    </div>
  )
}
