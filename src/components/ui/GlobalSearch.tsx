'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'

interface GlobalSearchProps {
  onSearch?: () => void
}

function SearchInputInner({ onSearch, initialQuery }: GlobalSearchProps & { initialQuery: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(initialQuery)
  const [isFocused, setIsFocused] = useState(false)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    const params = new URLSearchParams(searchParams)
    params.set('q', query.trim())
    
    router.push(`/products?${params.toString()}`)
    onSearch?.()
  }

  return (
    <form 
      onSubmit={handleSearch}
      className={cn(
        "relative flex items-center transition-all duration-300 w-full max-w-sm",
        isFocused ? "w-64 md:w-80" : "w-40 md:w-60"
      )}
    >
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className={cn("h-4 w-4 transition-colors", isFocused ? "text-primary" : "text-slate-400")} />
      </div>
      <input
        type="search"
        data-testid="global-search-input"
        placeholder="Search products..."
        className={cn(
          "block w-full pl-10 pr-4 py-2 text-sm bg-slate-100 border-transparent text-slate-900 placeholder-slate-500 rounded-full focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary/20 transition-all",
          isFocused && "bg-white shadow-sm ring-2 ring-primary/20"
        )}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
    </form>
  )
}

function SearchInputWrapper({ onSearch }: GlobalSearchProps) {
  const searchParams = useSearchParams()
  const q = searchParams.get('q') || ''
  
  return <SearchInputInner key={q} initialQuery={q} onSearch={onSearch} />
}

export function GlobalSearch({ onSearch }: GlobalSearchProps = {}) {
  return (
    <Suspense fallback={<div className="w-60 h-9 bg-slate-100 rounded-full animate-pulse" />}>
      <SearchInputWrapper onSearch={onSearch} />
    </Suspense>
  )
}
