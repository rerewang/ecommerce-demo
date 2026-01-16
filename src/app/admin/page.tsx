import { AdminProductList } from '@/components/admin/AdminProductList'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/Button'
import { Plus } from 'lucide-react'
import Link from 'next/link'

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-heading text-3xl font-bold text-slate-900 mb-2">
              商品管理
            </h1>
            <div className="flex gap-4 text-sm">
              <span className="text-slate-900 font-medium border-b-2 border-slate-900">
                商品管理
              </span>
              <Link href="/admin/orders" className="text-slate-500 hover:text-slate-900">
                订单管理
              </Link>
            </div>
          </div>
          <Button variant="primary">
            <Plus className="w-4 h-4 mr-2" />
            添加商品
          </Button>
        </div>
        
        <AdminProductList />
      </main>
    </div>
  )
}
