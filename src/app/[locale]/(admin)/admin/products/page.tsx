import { AdminProductList } from '@/components/admin/AdminProductList'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Plus } from 'lucide-react'

export default function AdminProductsPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">商品管理</h1>
        <Link href="/admin/products/new">
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            新增商品
          </Button>
        </Link>
      </div>
      <AdminProductList />
    </div>
  )
}
