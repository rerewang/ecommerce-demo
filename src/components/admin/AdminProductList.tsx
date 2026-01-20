'use client'

import { useEffect, useState } from 'react'
import { getProducts, deleteProduct } from '@/services/products'
import { Button } from '@/components/ui/Button'
import { formatCurrency } from '@/lib/utils'
import type { Product } from '@/types/product'
import { Edit, Trash2 } from 'lucide-react'

import Link from 'next/link'

export function AdminProductList() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  const loadProducts = async () => {
    try {
      const data = await getProducts()
      setProducts(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除吗？')) return
    
    try {
      await deleteProduct(id)
      setProducts(products.filter(p => p.id !== id))
    } catch {
      alert('删除失败')
    }
  }

  if (loading) return <div>加载中...</div>

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-heading font-bold text-slate-900">产品管理</h2>
      
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
