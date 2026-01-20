'use client'

import { useState } from 'react'
import { Product } from '@/types/product'
import { VariantSelector } from '@/components/products/VariantSelector'
import { BuyNowButton } from '@/components/products/BuyNowButton'
import { AddToCartButton } from '@/components/products/AddToCartButton'
import { ServiceBadges } from '@/components/products/ServiceBadges'

export function ProductDetailClient({ product }: { product: Product }) {
  const [selections, setSelections] = useState<Record<string, string>>(() => {
    const defaults: Record<string, string> = {}
    product.metadata?.variants?.forEach(v => {
        if (v.values.length > 0) defaults[v.name] = v.values[0]
    })
    return defaults
  })

  const isReady = product.metadata?.variants 
    ? product.metadata.variants.every(v => selections[v.name])
    : true

  return (
    <div>
       <VariantSelector 
         variants={product.metadata?.variants || []}
         selections={selections}
         onSelect={(n, v) => setSelections(prev => ({ ...prev, [n]: v }))}
       />
       
       <ServiceBadges />
       
       <div className="flex gap-4 mt-8">
         <AddToCartButton product={product} /> 
         <BuyNowButton product={product} variants={selections} disabled={!isReady} />
       </div>
    </div>
  )
}
