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
import { getLocalizedProduct } from '@/lib/i18n/product'
import { getTranslations, setRequestLocale } from 'next-intl/server'

export async function generateStaticParams() {
  const products = await getProducts()
  return products.map((product) => ({
    id: product.id,
  }))
}

export async function generateMetadata({ params }: { params: Promise<{ id: string; locale: string }> }): Promise<Metadata> {
  const { id, locale } = await params
  setRequestLocale(locale);
  const product = await getProductById(id)
  const t = await getTranslations('Products.detail')
  const tHome = await getTranslations('HomePage')
  
  if (!product) {
    return {
      title: t('notFoundTitle'),
    }
  }

  const localizedProduct = getLocalizedProduct(product, locale)

  return {
    title: `${localizedProduct.name} - ${tHome('title')}`,
    description: localizedProduct.description,
  }
}

export default async function ProductPage({ params }: { params: Promise<{ id: string; locale: string }> }) {
  const { id, locale } = await params
  setRequestLocale(locale);
  const product = await getProductById(id)
  const t = await getTranslations('Products.detail')
  
  if (!product) {
    notFound()
  }

  const localizedProduct = getLocalizedProduct(product, locale)
  
  return (
    <div className="min-h-screen bg-slate-50">
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-6">
          <Link href="/products">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('backToList')}
            </Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-white shadow-lg">
            <Image
              src={localizedProduct.image_url}
              alt={localizedProduct.name}
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
                {localizedProduct.category}
              </span>
            </div>
            
            <h1 className="font-heading text-4xl font-bold text-slate-900 mb-4">
              {localizedProduct.name}
            </h1>
            
            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
              {localizedProduct.description}
            </p>
            
            <div className="mb-8">
              <p className="text-sm text-slate-500 mb-2">{t('price')}</p>
              <p className="font-heading text-5xl font-bold text-primary-600">
                {formatCurrency(localizedProduct.price)}
              </p>
            </div>
            
            <div className="mb-8 p-4 bg-slate-100 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-slate-700">{t('stockStatus')}</span>
                <span className={`font-medium ${localizedProduct.stock > 0 ? 'text-success' : 'text-red-500'}`}>
                  {localizedProduct.stock > 0 ? t('inStock', { count: localizedProduct.stock }) : t('outOfStock')}
                </span>
              </div>
            </div>
            
            <ProductDetailClient product={localizedProduct} />

            <ProductFeatures metadata={localizedProduct.metadata} />
          </div>
        </div>
      </main>
    </div>
  )
}
