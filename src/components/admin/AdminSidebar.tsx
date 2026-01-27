'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'

export function AdminSidebar() {
  const t = useTranslations('Admin')

  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen fixed left-0 top-0 overflow-y-auto">
      <div className="p-6">
        <h1 className="text-xl font-bold">{t('title')}</h1>
      </div>
      <nav className="mt-6 px-4 space-y-2">
        <Link href="/admin" className="block px-4 py-2 rounded hover:bg-slate-800">{t('dashboard')}</Link>
        <Link href="/admin/products" className="block px-4 py-2 rounded hover:bg-slate-800">{t('products')}</Link>
        <Link href="/admin/orders" className="block px-4 py-2 rounded hover:bg-slate-800">{t('orders')}</Link>
        <Link href="/" className="block px-4 py-2 rounded hover:bg-slate-800 mt-8 text-slate-400 text-sm">{t('backToShop')}</Link>
      </nav>
    </aside>
  )
}
