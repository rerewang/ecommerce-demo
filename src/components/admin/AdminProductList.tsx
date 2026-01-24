'use client'

import { useCallback, useEffect, useState } from 'react'
import { getProducts, deleteProduct } from '@/services/products'
import { Button } from '@/components/ui/Button'
import { formatCurrency } from '@/lib/utils'
import { createClientComponentClient } from '@/lib/supabase'
import type { Product } from '@/types/product'
import { Edit, Trash2 } from 'lucide-react'

import Link from 'next/link'
import { regenerateAllEmbeddingsAction } from '@/app/actions/product-actions'
import { toast } from 'react-hot-toast'

export function AdminProductList() {
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
    if (!confirm('确定要删除吗？')) return
    
    try {
      await deleteProduct(supabase, id)
      setProducts(products.filter(p => p.id !== id))
    } catch {
      alert('删除失败')
    }
  }

  const handleRegenerateEmbeddings = async () => {
    if (!confirm('确定要重新生成所有商品的搜索向量吗？这可能需要几秒钟。')) return
    
    setIsRegenerating(true)
    try {
      const result = await regenerateAllEmbeddingsAction()
      if (result.success) {
        toast.success(`成功更新 ${result.successCount} 个商品的索引 (失败: ${result.errorCount})`)
      } else {
        toast.error('索引更新失败')
      }
    } catch (error) {
      console.error(error)
      toast.error('操作发生错误')
    } finally {
      setIsRegenerating(false)
    }
  }

  if (loading) return <div>加载中...</div>

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-heading font-bold text-slate-900">产品管理</h2>
        <Button 
          variant="outline" 
          onClick={handleRegenerateEmbeddings}
          disabled={isRegenerating}
        >
          {isRegenerating ? '生成中...' : '重新生成搜索索引'}
        </Button>
      </div>
      
      <div className="grid gap-4">
        {products.map(product => (
          <div key={product.id} className="bg-white p-4 rounded-lg border border-slate-200 flex items-center gap-4">
            <div className="flex-1">
              <h3 className="font-semibold">{product.name}</h3>
              <p className="text-slate-600">{formatCurrency(product.price)}</p>
              <p className="text-sm text-slate-500">库存: {product.stock}</p>
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
