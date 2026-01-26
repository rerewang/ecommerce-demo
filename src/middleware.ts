import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

export async function middleware(request: NextRequest) {
  // 1. Run next-intl middleware first to handle routing/locale
  const handleI18nRouting = createMiddleware(routing);
  const response = handleI18nRouting(request);

  // Skip supabase if env vars not available (build time)
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return response
  }

  // 2. Initialize Supabase Client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname;
  const locale = routing.locales.find(
    (l) => pathname.startsWith(`/${l}/`) || pathname === `/${l}`
  ) || routing.defaultLocale;

  const pathnameWithoutLocale = pathname.replace(new RegExp(`^/${locale}`), '') || '/';

  // 3. Protect routes
  if (pathnameWithoutLocale.startsWith('/admin') && !user) {
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url))
  }

  if (pathnameWithoutLocale.startsWith('/checkout') && !user) {
    return NextResponse.redirect(new URL(`/${locale}/login?redirect=/checkout`, request.url))
  }

  if (pathnameWithoutLocale.startsWith('/admin') && user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
      
    if (profile?.role !== 'admin') {
      return NextResponse.redirect(new URL(`/${locale}`, request.url))
    }
  }

  if (pathnameWithoutLocale.startsWith('/login') && user) {
    return NextResponse.redirect(new URL(`/${locale}`, request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!api|health|_next|_vercel|.*\\..*).*)',
  ],
}
