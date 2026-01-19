'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { ProductFilterBar } from './ProductFilterBar'
import type { ProductFilter } from '@/types/product'

export function ProductFilterContainer() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handleFilterChange = useCallback((filter: ProductFilter) => {
    const params = new URLSearchParams(searchParams)

    if (filter.query) params.set('q', filter.query)
    else params.delete('q')

    if (filter.category) params.set('category', filter.category)
    else params.delete('category')

    if (filter.sort && filter.sort !== 'newest') params.set('sort', filter.sort)
    else params.delete('sort')

    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }, [pathname, router, searchParams])

  return (
    <ProductFilterBar 
      initialFilter={{
        query: searchParams.get('q') || '',
        category: searchParams.get('category') || '',
        sort: (searchParams.get('sort') as ProductFilter['sort']) || 'newest'
      }}
      onFilterChange={handleFilterChange} 
    />
  )
}
