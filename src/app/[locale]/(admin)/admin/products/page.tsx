import { AdminProductList } from '@/components/admin/AdminProductList'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Plus } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

export default async function AdminProductsPage() {
  const t = await getTranslations('Admin')

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('productManagement')}</h1>
        <Link href="/admin/products/new">
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            {t('createProduct')}
          </Button>
        </Link>
      </div>
      <AdminProductList />
    </div>
  )
}
