import { ProductForm } from '@/components/admin/ProductForm'
import { getTranslations } from 'next-intl/server'

export default async function NewProductPage() {
  const t = await getTranslations('Admin')

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t('createProduct')}</h1>
      <ProductForm />
    </div>
  )
}
