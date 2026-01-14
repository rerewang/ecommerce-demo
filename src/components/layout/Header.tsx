import Link from 'next/link'
import { CartBadge } from '@/components/cart/CartBadge'
import { Button } from '@/components/ui/Button'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { User, LogOut } from 'lucide-react'
import { logout } from '@/app/login/actions'

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
        setAll(cookiesToSet) {
          // View-only, no need to set
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  return (
    <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center">
            <h1 className="font-heading text-2xl font-bold text-slate-900">
              电商 Demo
            </h1>
          </Link>
          
          <nav className="flex items-center gap-6">
            <Link
              href="/"
              className="text-slate-700 hover:text-slate-900 font-medium transition-colors"
            >
              商品列表
            </Link>
            
            {user ? (
              <>
                <Link
                  href="/admin"
                  className="text-slate-700 hover:text-slate-900 font-medium transition-colors"
                >
                  管理后台
                </Link>
                <div className="flex items-center gap-2 text-sm text-slate-600 border-l pl-4 border-slate-200">
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">{user.email}</span>
                </div>
                <form action={logout}>
                  <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                    <LogOut className="w-4 h-4 mr-2" />
                    退出
                  </Button>
                </form>
              </>
            ) : (
              <Link href="/login">
                <Button variant="secondary" size="sm">登录</Button>
              </Link>
            )}
            
            <CartBadge />
          </nav>
        </div>
      </div>
    </header>
  )
}
