import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default function ProductNotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="font-heading text-4xl font-bold text-slate-900 mb-4">
          商品未找到
        </h1>
        <p className="text-slate-600 mb-8">
          抱歉，该商品不存在或已下架
        </p>
        <Link href="/">
          <Button variant="primary">返回首页</Button>
        </Link>
      </div>
    </div>
  )
}
