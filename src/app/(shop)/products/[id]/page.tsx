import { notFound } from 'next/navigation'
import Image from 'next/image'
import { getProductById, getProducts } from '@/services/products'
import { formatCurrency } from '@/lib/utils'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import type { Metadata } from 'next'
import { ProductDetailClient } from './ProductDetailClient'
import { ProductFeatures } from '@/components/products/ProductFeatures'

export async function generateStaticParams() {
  const products = await getProducts()
  return products.map((product) => ({
    id: product.id,
  }))
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const product = await getProductById(id)
  
  if (!product) {
    return {
      title: '商品未找到',
    }
  }

  return {
    title: `${product.name} - 电商 Demo`,
    description: product.description,
  }
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = await getProductById(id)
  
  if (!product) {
    notFound()
  }
  
  return (
    <div className="min-h-screen bg-slate-50">
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回商品列表
            </Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-white shadow-lg">
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          
          {/* Product Info */}
          <div className="flex flex-col">
            <div className="mb-4">
              <span className="inline-block px-3 py-1 text-sm font-medium bg-primary-50 text-primary-600 rounded-lg">
                {product.category}
              </span>
            </div>
            
            <h1 className="font-heading text-4xl font-bold text-slate-900 mb-4">
              {product.name}
            </h1>
            
            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
              {product.description}
            </p>
            
            <div className="mb-8">
              <p className="text-sm text-slate-500 mb-2">价格</p>
              <p className="font-heading text-5xl font-bold text-primary-600">
                {formatCurrency(product.price)}
              </p>
            </div>
            
            <div className="mb-8 p-4 bg-slate-100 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-slate-700">库存状态</span>
                <span className={`font-medium ${product.stock > 0 ? 'text-success' : 'text-red-500'}`}>
                  {product.stock > 0 ? `${product.stock} 件可售` : '已售罄'}
                </span>
              </div>
            </div>
            
            <ProductDetailClient product={product} />

            <ProductFeatures metadata={product.metadata} />
          </div>
        </div>
      </main>
    </div>
  )
}
