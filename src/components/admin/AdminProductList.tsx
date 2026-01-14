'use client'

import { useEffect, useState } from 'react'
import { getProducts, deleteProduct } from '@/services/products'
import { Button } from '@/components/ui/Button'
import { formatCurrency } from '@/lib/utils'
import type { Product } from '@/types/product'
import { Edit, Trash2, Plus } from 'lucide-react'

export function AdminProductList() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  const loadProducts = async () => {
    try {
      const data = await getProducts()
      setProducts(data)
    } catch (error) {
      console.error(error)
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
    } catch (error) {
      alert('删除失败')
    }
  }

  if (loading) return <div>加载中...</div>

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="p-4 font-medium text-slate-600">商品名称</th>
              <th className="p-4 font-medium text-slate-600">分类</th>
              <th className="p-4 font-medium text-slate-600">价格</th>
              <th className="p-4 font-medium text-slate-600">库存</th>
              <th className="p-4 font-medium text-slate-600 text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-slate-50">
                <td className="p-4 font-medium text-slate-900">{product.name}</td>
                <td className="p-4 text-slate-600">{product.category}</td>
                <td className="p-4 text-slate-600">{formatCurrency(product.price)}</td>
                <td className="p-4 text-slate-600">{product.stock}</td>
                <td className="p-4 text-right space-x-2">
                  <Button variant="ghost" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={() => handleDelete(product.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                    删除
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
