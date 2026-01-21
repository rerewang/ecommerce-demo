import Link from 'next/link'
import { CartBadge } from '@/components/cart/CartBadge'
import { Button } from '@/components/ui/Button'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { User, LogOut } from 'lucide-react'
import { logout } from '@/app/(shop)/login/actions'

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
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="flex items-center group">
            <h1 className="font-serif text-2xl font-medium tracking-tight text-stone-900 group-hover:text-primary transition-colors">
              PetPixel
            </h1>
          </Link>
          
          <nav className="flex items-center gap-8">
            <Link
              href="/"
              className="text-stone-600 hover:text-stone-900 font-medium transition-colors text-sm tracking-wide"
            >
              Home
            </Link>
            <Link
              href="/products"
              className="text-stone-600 hover:text-stone-900 font-medium transition-colors text-sm tracking-wide"
            >
              Gallery
            </Link>
            
            {user ? (
              <>
                <Link
                  href="/orders"
                  className="text-stone-600 hover:text-stone-900 font-medium transition-colors text-sm tracking-wide"
                >
                  My Orders
                </Link>
                <Link
                  href="/admin"
                  className="text-stone-600 hover:text-stone-900 font-medium transition-colors text-sm tracking-wide"
                >
                  Admin
                </Link>
                <div className="flex items-center gap-2 text-sm text-stone-500 border-l pl-4 border-stone-200">
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline font-medium">{user.email}</span>
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
            
            <CartBadge />
          </nav>
        </div>
      </div>
    </header>
  )
}
