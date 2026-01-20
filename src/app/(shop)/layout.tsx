import { Header } from '@/components/layout/Header'

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-slate-50 pb-20">
        {children}
      </main>
    </>
  )
}
