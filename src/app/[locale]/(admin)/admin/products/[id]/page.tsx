import { getProductById } from '@/services/products'
import { ProductForm } from '@/components/admin/ProductForm'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = await getProductById(id)
  const t = await getTranslations('Admin')

  if (!product) {
    notFound()
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t('editProduct')}</h1>
      <ProductForm initialData={product} isEdit />
    </div>
  )
}
