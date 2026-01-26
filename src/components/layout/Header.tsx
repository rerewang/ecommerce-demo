import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { CartBadge } from '@/components/cart/CartBadge'
import { Button } from '@/components/ui/Button'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { User, LogOut, Package } from 'lucide-react'
import { logout } from '@/app/[locale]/(shop)/login/actions'
import { GlobalSearch } from '@/components/ui/GlobalSearch'
import { MobileNav } from './MobileNav'
import { NotificationBell } from '@/components/ui/NotificationBell'

export async function Header() {
  const t = await getTranslations('Navigation')
  const cookieStore = await cookies()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll() {
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-white/50 sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20 gap-4">
          <div className="flex items-center gap-4 flex-shrink-0">
            <MobileNav user={user} />
            <Link href="/" className="flex items-center group">
              <h1 className="font-serif text-xl md:text-2xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
                PetPixel
              </h1>
            </Link>

            <nav className="hidden md:flex items-center gap-6 ml-4">
              <Link
                href="/"
                className="text-muted-foreground hover:text-foreground font-medium transition-colors text-sm tracking-wide"
              >
                {t('home')}
              </Link>
              <Link
                href="/products"
                className="text-muted-foreground hover:text-foreground font-medium transition-colors text-sm tracking-wide"
              >
                {t('gallery')}
              </Link>
              <Link
                href="/features/ai-curator"
                className="text-muted-foreground hover:text-foreground font-medium transition-colors text-sm tracking-wide group flex items-center gap-1"
              >
                {t('aiAssistant')}
                <span className="hidden group-hover:inline-block text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full ml-1">{t('new')}</span>
              </Link>
            </nav>
          </div>
          
          <div className="hidden md:flex flex-1 justify-end max-w-md mx-4">
            <GlobalSearch />
          </div>

          <div className="hidden md:flex items-center gap-4 flex-shrink-0">
            <div className="border-r md:border-none pr-4 md:pr-0">
               <CartBadge />
            </div>

            {user ? (
              <>
                <Link
                  href="/orders"
                  className="text-muted-foreground hover:text-foreground font-medium transition-colors p-2 hover:bg-slate-100 rounded-full"
                  title={t('myOrders')}
                >
                  <Package className="w-5 h-5" />
                </Link>
                {user.role === 'admin' && (
                  <Link
                    href="/admin"
                    className="text-muted-foreground hover:text-foreground font-medium transition-colors text-sm tracking-wide"
                  >
                    {t('admin')}
                  </Link>
                )}
                <div className="flex items-center gap-2">
                  <NotificationBell />
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground border-l pl-4 border-stone-200">
                  <User className="w-4 h-4" />
                  <span className="hidden lg:inline font-medium max-w-[150px] truncate">
                    {user.email?.split('@')[0] || 'User'}
                  </span>
                </div>
                <form action={logout}>
                  <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50/50">
                    <LogOut className="w-4 h-4 mr-2" />
                    {t('exit')}
                  </Button>
                </form>
              </>
            ) : (
              <Link href="/login">
                <Button variant="secondary" size="sm" className="rounded-full px-6">{t('signIn')}</Button>
              </Link>
            )}
          </div>

          <div className="md:hidden flex items-center gap-2">
             <CartBadge />
          </div>
        </div>
      </div>
    </header>
  )
}
