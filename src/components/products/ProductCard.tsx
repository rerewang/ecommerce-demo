'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent, CardFooter } from '@/components/ui/Card'
import { AddToCartButton } from '@/components/products/AddToCartButton'
import { formatCurrency } from '@/lib/utils'
import type { Product } from '@/types/product'

export interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/products/${product.id}`}>
      <Card hover className="h-full flex flex-col">
        <div className="relative aspect-square overflow-hidden rounded-t-xl">
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>
        
        <CardContent className="flex-1 flex flex-col pt-4">
          <div className="mb-2">
            <span className="inline-block px-2 py-1 text-xs font-medium bg-primary-50 text-primary-600 rounded-md">
              {product.category}
            </span>
          </div>
          
          <h3 className="font-heading text-lg font-semibold text-slate-900 mb-2">
            {product.name}
          </h3>
          
          <p className="text-sm text-slate-600 line-clamp-2 mb-4">
            {product.description}
          </p>
          
          <div className="mt-auto">
            <p className="font-heading text-2xl font-bold text-primary-600">
              {formatCurrency(product.price)}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              库存: {product.stock}
            </p>
          </div>
        </CardContent>
        
        <CardFooter>
          <div className="w-full" onClick={(e) => e.preventDefault()}>
            <AddToCartButton product={product} />
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
}
