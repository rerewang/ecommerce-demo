'use client'

import { useCallback, useEffect, useState } from 'react'
import { getProducts, deleteProduct } from '@/services/products'
import { Button } from '@/components/ui/Button'
import { formatCurrency } from '@/lib/utils'
import { createClientComponentClient } from '@/lib/supabase'
import type { Product } from '@/types/product'
import { Edit, Trash2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

import Link from 'next/link'
import { regenerateAllEmbeddingsAction } from '@/app/actions/product-actions'
import { toast } from 'react-hot-toast'

export function AdminProductList() {
  const t = useTranslations('Admin')
  const supabase = createClientComponentClient()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [isRegenerating, setIsRegenerating] = useState(false)

  const loadProducts = useCallback(async () => {
    try {
      const data = await getProducts(undefined, supabase)
      setProducts(data)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  const handleDelete = async (id: string) => {
    if (!confirm(t('confirmDelete'))) return
    
    try {
      await deleteProduct(supabase, id)
      setProducts(products.filter(p => p.id !== id))
    } catch {
      alert(t('deleteFailed'))
    }
  }

  const handleRegenerateEmbeddings = async () => {
    if (!confirm(t('confirmRegenerate'))) return
    
    setIsRegenerating(true)
    try {
      const result = await regenerateAllEmbeddingsAction()
      if (result.success) {
        toast.success(t('regenerateSuccess', { count: result.successCount, errorCount: result.errorCount }))
      } else {
        toast.error(t('regenerateFailed'))
      }
    } catch (error) {
      console.error(error)
      toast.error(t('errorOccurred'))
    } finally {
      setIsRegenerating(false)
    }
  }

  if (loading) return <div>{t('loading')}</div>

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-heading font-bold text-slate-900">{t('productManagement')}</h2>
        <Button 
          variant="outline" 
          onClick={handleRegenerateEmbeddings}
          disabled={isRegenerating}
        >
          {isRegenerating ? t('regenerating') : t('regenerateIndex')}
        </Button>
      </div>
      
      <div className="grid gap-4">
        {products.map(product => (
          <div key={product.id} className="bg-white p-4 rounded-lg border border-slate-200 flex items-center gap-4">
            <div className="flex-1">
              <h3 className="font-semibold">{product.name}</h3>
              <p className="text-slate-600">{formatCurrency(product.price)}</p>
              <p className="text-sm text-slate-500">{t('form.stock')}: {product.stock}</p>
            </div>
            <div className="flex gap-2">
              <Link href={`/admin/products/${product.id}`}>
                <Button variant="outline" size="sm">
                  <Edit className="w-4 h-4" />
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={() => handleDelete(product.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
