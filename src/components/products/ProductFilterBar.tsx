'use client'

import { useEffect, useState, useRef } from 'react'
import type { ProductFilter } from '@/types/product'
import { useDebounce } from '@/lib/hooks'

interface ProductFilterBarProps {
  onFilterChange: (filter: ProductFilter) => void
  initialFilter?: ProductFilter
}

export function ProductFilterBar({ onFilterChange, initialFilter }: ProductFilterBarProps) {
  const [query, setQuery] = useState(initialFilter?.query || '')
  const [category, setCategory] = useState(initialFilter?.category || '')
  const [sort, setSort] = useState<ProductFilter['sort']>(initialFilter?.sort || 'newest')
  
  const isMounted = useRef(false)
  const onFilterChangeRef = useRef(onFilterChange)
  const debouncedQuery = useDebounce(query, 300)

  useEffect(() => {
    onFilterChangeRef.current = onFilterChange
  }, [onFilterChange])

  // Unified filter change handler
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true
      return
    }
    onFilterChangeRef.current({ query: debouncedQuery, category, sort })
  }, [debouncedQuery, category, sort])

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6 p-4 bg-white rounded-lg shadow-sm border border-gray-100">
      <div className="flex-1">
        <input
          type="text"
          placeholder="Search products..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      
      <div className="flex gap-4">
        <select
          aria-label="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
        >
          <option value="">All Categories</option>
          <option value="Electronics">Electronics</option>
          <option value="Wearables">Wearables</option>
          <option value="Accessories">Accessories</option>
        </select>

        <select
          aria-label="Sort"
          value={sort}
          onChange={(e) => setSort(e.target.value as ProductFilter['sort'])}
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
        >
          <option value="newest">Newest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </div>
    </div>
  )
}
