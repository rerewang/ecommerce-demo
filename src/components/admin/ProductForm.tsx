'use client'

import { useState } from 'react'
import { Product, CreateProductInput } from '@/types/product'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { MetadataEditor } from './MetadataEditor'
import { createProductAction, updateProductAction } from '@/app/actions/product-actions'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'

import { toast } from 'react-hot-toast'

interface Props {
  initialData?: Product
  isEdit?: boolean
}

export function ProductForm({ initialData, isEdit }: Props) {
  const t = useTranslations('Admin')
  const router = useRouter()
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
        await updateProductAction(initialData.id, formData)
      } else {
        // Ensure formData has required fields for creation
        const input = formData as unknown as CreateProductInput
        await createProductAction(input)
        router.push('/admin/products')
        router.refresh()
        return
      }
      
      toast.success(t('form.saveSuccess'))
      router.refresh()
    } catch (error) {
      console.error('Failed to save product', error)
      alert(t('form.saveFailed'))
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
          <label className="text-sm font-medium">{t('form.name')}</label>
          <Input name="name" value={formData.name} onChange={handleChange} required />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">{t('form.category')}</label>
          <Input name="category" value={formData.category} onChange={handleChange} required />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">{t('form.price')}</label>
          <Input name="price" type="number" value={formData.price} onChange={handleChange} required />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">{t('form.stock')}</label>
          <Input name="stock" type="number" value={formData.stock} onChange={handleChange} required />
        </div>
        <div className="col-span-2 space-y-2">
          <label className="text-sm font-medium">{t('form.description')}</label>
          <textarea 
            name="description" 
            value={formData.description} 
            onChange={handleChange}
            className="w-full rounded-md border border-slate-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            rows={4}
          />
        </div>
        <div className="col-span-2 space-y-2">
          <label className="text-sm font-medium">{t('form.images')}</label>
          <Input name="image_url" value={formData.image_url} onChange={handleChange} required />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">{t('form.metadata')}</label>
        <MetadataEditor 
          value={formData.metadata} 
          onChange={(val) => setFormData(prev => ({ ...prev, metadata: val }))} 
        />
      </div>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="secondary" onClick={() => router.back()}>{t('form.cancel')}</Button>
        <Button type="submit" disabled={loading}>
          {loading ? t('form.saving') : t('form.save')}
        </Button>
      </div>
    </form>
  )
}
