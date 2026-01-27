import { CheckoutForm } from '@/components/checkout/CheckoutForm'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'

export const dynamic = 'force-dynamic';

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ source?: string }> }) {
  const cookieStore = await cookies()
  const { source } = await searchParams
  const t = await getTranslations('Checkout')
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login?redirect=/checkout')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="font-heading text-3xl font-bold text-slate-900 mb-8 text-center">
          {t('pageTitle')}
        </h1>
        
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 max-w-2xl mx-auto">
          <CheckoutForm userId={user.id} source={source} />
        </div>
      </main>
    </div>
  )
}
