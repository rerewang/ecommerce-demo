# i18n Implementation Plan (Technical Architecture)

## 1. Technical Architecture

### 1.1 Middleware Strategy ("The Chain")
The most complex technical challenge is coordinating Supabase Auth and `next-intl` routing. We will use a "cascading response" pattern.

**Request Flow:**
1.  **Incoming Request**: `GET /admin/dashboard`
2.  **Step 1: Internationalization (next-intl)**
    *   Resolves locale (e.g., defaults to `en`).
    *   Constructs a `NextResponse` (sets `x-middleware-request-url`, handles redirects like `/` -> `/en`).
3.  **Step 2: Authentication (Supabase)**
    *   Receives the `NextResponse` from Step 1.
    *   Initializes Supabase Client using this response (to access cookies).
    *   Checks User Session.
    *   **Decision Matrix**:
        *   *Authorized*: Return the response.
        *   *Unauthorized*: Create a **new** redirect response to `/[locale]/login`.
            *   *Note*: Must strictly respect the resolved locale from Step 1.
4.  **Final Output**: Served to client.

### 1.2 Directory Structure & Routing
We will use Dynamic Route Segments for top-level localization.

```
src/
├── app/
│   ├── api/                 # Global API (Excluded from i18n)
│   ├── [locale]/            # 🌍 Localization Root
│   │   ├── (admin)/         # Admin Route Group
│   │   │   ├── admin/
│   │   │   └── layout.tsx   # Admin Layout (Sidebar etc)
│   │   ├── (shop)/          # Shop Route Group
│   │   │   ├── cart/
│   │   │   ├── login/
│   │   │   └── page.tsx     # Home Page
│   │   ├── layout.tsx       # 🏗️ Root Layout (Providers, HTML lang)
│   │   └── not-found.tsx
│   └── layout.tsx           # ⚡️ Root Redirector (redirects / to /en)
├── components/              # UI Components (Shared)
├── i18n/
│   ├── request.ts           # Server-side config (getRequestConfig)
│   └── routing.ts           # Shared navigation logic (pathnames, locales)
├── messages/
│   ├── en.json              # English Source of Truth
│   └── zh.json              # Chinese Translations
└── middleware.ts            # 🛡️ Combined Middleware
```

### 1.3 Data Flow & State

#### Server Components (RSC)
- **Fetching**: Directly use `await getTranslations('Namespace')`.
- **Props**: Pass translated strings to dumb components if needed, OR pass data keys.

#### Client Components
- **Provider**: `NextIntlClientProvider` wraps the app in `[locale]/layout.tsx`.
- **Usage**: `const t = useTranslations('Namespace')`.

#### Global State (Zustand)
- **Constraint**: Zustand stores are outside the React Tree/Provider context.
- **Pattern**: 
    - Stores should hold **Translation Keys** (e.g., `status: 'CART.EMPTY'`), NOT translated strings.
    - Components subscribe to the store and translate the key: `t(store.status)`.
    - **Server Actions**: If an action fails, return `{ error: 'ERR_LOGIN_FAILED' }`. The component receiving the result translates it.

### 1.4 Navigation & APIs
- **Link Component**: MUST replace `import Link from 'next/link'` with `import { Link } from '@/i18n/routing'`.
- **API Routes**: Keep standard endpoints (`/api/orders`).
    - *Middleware Config*: Ensure `matcher` excludes `/api/*` to prevent `/en/api/orders` redirects, UNLESS we want localized API errors (usually not needed for MVP).

## 2. Implementation Steps

### Phase 1: Infrastructure (The "Skeleton")
1.  **Dependencies**: `npm install next-intl`.
2.  **Configuration**: 
    - `src/i18n/routing.ts`: Define `locales: ['en', 'zh']`.
    - `src/i18n/request.ts`: Setup message loading.
    - `next.config.ts`: Add `createNextIntlPlugin`.
3.  **Middleware Core**: Refactor `middleware.ts` to implement the "Chain" strategy described in 1.1.

### Phase 2: Structural Migration (The "Move")
1.  **Root Move**: Create `src/app/[locale]` and move `(admin)` and `(shop)` inside.
2.  **Layout Refactor**:
    - Move `src/app/layout.tsx` logic to `src/app/[locale]/layout.tsx`.
    - Create a minimal root `src/app/layout.tsx` that just handles initial redirects.
3.  **Provider Setup**: Wrap children in `NextIntlClientProvider`.

### Phase 3: Component Updates (The "Refactor")
1.  **Navigation**: Bulk replace `Link` and `useRouter` with i18n versions.
2.  **Hardcoded Text**:
    - Start with **Layouts** (Nav, Footer).
    - Move to **Pages** (Login, Product Detail).
    - Finish with **Features** (Cart, Checkout).

### Phase 4: Verification (The "Test")
1.  **E2E Update**: Update Playwright `baseURL` or navigation steps to include `/en`.
2.  **Auth Check**: Verify `/zh/admin` redirects to `/zh/login` (preserving locale).
3.  **Smoke Test**: Switch language -> Refresh page -> Verify content remains localized.

## 3. Decision Log
- **Why Sub-path (`/en`)?**: Best for SEO and explicit state. No cookies-only magic.
- **Why English as Default?**: Matches current codebase, easiest transition.
- **Why Separate `messages/` folder?**: Standard convention, keeps translations de-coupled from code.
