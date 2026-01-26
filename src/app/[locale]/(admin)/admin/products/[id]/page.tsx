import { getProductById } from '@/services/products'
import { ProductForm } from '@/components/admin/ProductForm'
import { notFound } from 'next/navigation'

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = await getProductById(id)

  if (!product) {
    notFound()
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">编辑商品</h1>
      <ProductForm initialData={product} isEdit />
    </div>
  )
}
