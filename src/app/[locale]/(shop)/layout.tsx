import { Header } from '@/components/layout/Header'
import { setRequestLocale } from 'next-intl/server';

// export const dynamic = 'force-dynamic';

export default async function ShopLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-slate-50 pb-20">
        {children}
      </main>
    </>
  )
}
