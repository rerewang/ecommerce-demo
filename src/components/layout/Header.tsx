import Link from 'next/link'
import { CartBadge } from '@/components/cart/CartBadge'
import { Button } from '@/components/ui/Button'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { User, LogOut } from 'lucide-react'
import { logout } from '@/app/(shop)/login/actions'
import { GlobalSearch } from '@/components/ui/GlobalSearch'
import { MobileNav } from './MobileNav'
import { NotificationBell } from '@/components/ui/NotificationBell'

export async function Header() {
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
                Home
              </Link>
              <Link
                href="/products"
                className="text-muted-foreground hover:text-foreground font-medium transition-colors text-sm tracking-wide"
              >
                Gallery
              </Link>
              <Link
                href="/features/ai-curator"
                className="text-muted-foreground hover:text-foreground font-medium transition-colors text-sm tracking-wide group flex items-center gap-1"
              >
                AI Assistant
                <span className="hidden group-hover:inline-block text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full ml-1">New</span>
              </Link>
            </nav>
          </div>
          
          <div className="hidden md:flex flex-1 justify-end max-w-md mx-4">
            <GlobalSearch />
          </div>

          <div className="hidden md:flex items-center gap-4 flex-shrink-0">
            {user ? (
              <>
                <Link
                  href="/orders"
                  className="text-muted-foreground hover:text-foreground font-medium transition-colors text-sm tracking-wide"
                >
                  My Orders
                </Link>
                {user.role === 'admin' && (
                  <Link
                    href="/admin"
                    className="text-muted-foreground hover:text-foreground font-medium transition-colors text-sm tracking-wide"
                  >
                    Admin
                  </Link>
                )}
                <div className="flex items-center gap-2">
                  <NotificationBell />
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground border-l pl-4 border-stone-200">
                  <User className="w-4 h-4" />
                  <span className="hidden lg:inline font-medium max-w-[150px] truncate">{user.email}</span>
                </div>
                <form action={logout}>
                  <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50/50">
                    <LogOut className="w-4 h-4 mr-2" />
                    Exit
                  </Button>
                </form>
              </>
            ) : (
              <Link href="/login">
                <Button variant="secondary" size="sm" className="rounded-full px-6">Sign In</Button>
              </Link>
            )}
            
            <div className="border-l md:border-none pl-4 md:pl-0">
               <CartBadge />
            </div>
          </div>

          <div className="md:hidden flex items-center gap-2">
             <CartBadge />
          </div>
        </div>
      </div>
    </header>
  )
}
