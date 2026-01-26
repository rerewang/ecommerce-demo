# I18n Strategy Evaluation & Recommendation

## Executive Summary
We recommend **`next-intl`** for the `ecommerce-demo` project. 
It provides native Server Component support (zero client-side JS for static content), excellent TypeScript integration, and seamless compatibility with the App Router architecture.

## Comparison: next-intl vs react-i18next

| Feature | next-intl | react-i18next |
|---------|-----------|---------------|
| **App Router Support** | Native (First-class) | Adapted (Manual setup) |
| **Server Components** | `await getTranslations()` (Zero Bundle) | Requires `initTranslations` boilerplate |
| **Client Components** | Partial hydration (Providers only where needed) | Full provider wrapping often required |
| **Middleware** | Built-in, composable | External dependency (`next-i18n-router`) |
| **Setup Complexity** | Low (Plugin-based) | High (Manual wiring) |

## Implementation Strategy: Middleware Chaining

To integrate `next-intl` with Supabase Auth, we must use a "chaining" pattern where `next-intl` processes routing/locales first, and Supabase attaches cookies to the resulting response.

### Proposed Middleware Structure (`src/middleware.ts`)

```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

const handleI18nRequest = createMiddleware(routing)

export async function middleware(request: NextRequest) {
  // 1. Run next-intl first (Routing & Locales)
  let response = handleI18nRequest(request)

  // 2. Initialize Supabase (Cookie Management)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, options) // Apply to next-intl response
          })
        },
      },
    }
  )

  // 3. Auth Verification
  const { data: { user } } = await supabase.auth.getUser()

  // 4. Route Protection (Locale-aware)
  // Matches /admin, /en/admin, /de/checkout, etc.
  const isProtectedPath = request.nextUrl.pathname.match(/^\/(?:[a-z]{2}\/)?(?:admin|checkout)/)
  const isAuthPath = request.nextUrl.pathname.match(/^\/(?:[a-z]{2}\/)?login/)

  if (isProtectedPath && !user) {
    const locale = request.cookies.get('NEXT_LOCALE')?.value || 'en'
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url))
  }

  if (isAuthPath && user) {
    const locale = request.cookies.get('NEXT_LOCALE')?.value || 'en'
    return NextResponse.redirect(new URL(`/${locale}`, request.url))
  }

  return response
}

export const config = {
  matcher: ['/', '/(de|en)/:path*', '/((?!_next|favicon.ico|.*\\..*).*)']
}
```

## Next Steps for Implementation
1. Install dependencies: `npm install next-intl`
2. Configure `src/i18n/request.ts` and `src/i18n/routing.ts`
3. Refactor `src/app` to move pages under `[locale]` dynamic route
4. Update `src/middleware.ts` with the chaining logic
