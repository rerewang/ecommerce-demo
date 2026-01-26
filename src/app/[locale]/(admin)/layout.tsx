import Link from 'next/link'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-slate-100 flex">
      <aside className="w-64 bg-slate-900 text-white min-h-screen fixed left-0 top-0 overflow-y-auto">
        <div className="p-6">
          <h1 className="text-xl font-bold">Admin Panel</h1>
        </div>
        <nav className="mt-6 px-4 space-y-2">
          <Link href="/admin" className="block px-4 py-2 rounded hover:bg-slate-800">Dashboard</Link>
          <Link href="/admin/products" className="block px-4 py-2 rounded hover:bg-slate-800">Products</Link>
          <Link href="/admin/orders" className="block px-4 py-2 rounded hover:bg-slate-800">Orders</Link>
          <Link href="/" className="block px-4 py-2 rounded hover:bg-slate-800 mt-8 text-slate-400 text-sm">Back to Shop</Link>
        </nav>
      </aside>
      
      <main className="flex-1 ml-64 p-8">
        {children}
      </main>
    </div>
  )
}
