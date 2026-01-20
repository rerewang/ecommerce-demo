'use client'

import { useState } from 'react'
import { Product, CreateProductInput } from '@/types/product'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { MetadataEditor } from './MetadataEditor'
import { createProduct, updateProduct } from '@/services/products'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@/lib/supabase'

import { toast } from 'react-hot-toast'

interface Props {
  initialData?: Product
  isEdit?: boolean
}

export function ProductForm({ initialData, isEdit }: Props) {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<Partial<Product>>(initialData || {
    name: '',
    description: '',
    price: 0,
    stock: 0,
    category: '',
    image_url: '',
    metadata: {}
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (isEdit && initialData) {
        await updateProduct(supabase, initialData.id, formData)
      } else {
        // Ensure formData has required fields for creation
        const input = formData as unknown as CreateProductInput
        await createProduct(supabase, input)
        router.push('/admin/products')
        router.refresh()
        return
      }
      
      toast.success('保存成功')
      router.refresh()
    } catch (error) {
      console.error('Failed to save product', error)
      alert('保存失败')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'stock' ? Number(value) : value
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl bg-white p-8 rounded-lg shadow">
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">商品名称</label>
          <Input name="name" value={formData.name} onChange={handleChange} required />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">分类</label>
          <Input name="category" value={formData.category} onChange={handleChange} required />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">价格</label>
          <Input name="price" type="number" value={formData.price} onChange={handleChange} required />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">库存</label>
          <Input name="stock" type="number" value={formData.stock} onChange={handleChange} required />
        </div>
        <div className="col-span-2 space-y-2">
          <label className="text-sm font-medium">描述</label>
          <textarea 
            name="description" 
            value={formData.description} 
            onChange={handleChange}
            className="w-full rounded-md border border-slate-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            rows={4}
          />
        </div>
        <div className="col-span-2 space-y-2">
          <label className="text-sm font-medium">图片 URL</label>
          <Input name="image_url" value={formData.image_url} onChange={handleChange} required />
        </div>
      </div>

      <MetadataEditor 
        value={formData.metadata} 
        onChange={(val) => setFormData(prev => ({ ...prev, metadata: val }))} 
      />

      <div className="flex justify-end gap-4">
        <Button type="button" variant="secondary" onClick={() => router.back()}>取消</Button>
        <Button type="submit" disabled={loading}>
          {loading ? '保存中...' : '保存商品'}
        </Button>
      </div>
    </form>
  )
}
