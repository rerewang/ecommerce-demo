# Product Detail Page (PDP) Optimization & Process Recovery Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Correct process violations and implement missing Product Detail Page (PDP) optimizations including SEO, Performance, and UX enhancements.

**Architecture:**
- **Process**: Update `AGENTS.md` to explicitly forbid task divergence.
- **Service Layer**: Enhance `getProductsByCategory` to support exclusion and limits for "Related Products".
- **PDP Optimization**:
    - **SEO**: JSON-LD structured data.
    - **Performance**: `generateStaticParams` for SSG.
    - **UX**: Skeleton loading state (`loading.tsx`), Error boundary (`error.tsx`), Related Products section.

**Tech Stack:** Next.js App Router (Server Components), Tailwind CSS, Vitest, Playwright.

### Task 1: Enforce Process Rules

**Files:**
- Modify: `AGENTS.md`

**Step 1: Update AGENTS.md**

Add "Strict Planning & Anti-Divergence" section to `AGENTS.md` to prevent future process violations.

```markdown
## Process Integrity (Strict)

### 1. Plan First, Code Second
- **NEVER** start coding without a written plan in `docs/plans/`.
- **NEVER** diverge from the approved plan.
- If a new idea arises (e.g., "better way to do X"), **STOP**. Ask user: "This deviates from plan. Should I update the plan first?"

### 2. Task Isolation
- Finish the current task completely before starting the next.
- Do not mix multiple features in one session/worktree.
- If you find yourself working on a file unrelated to the current task → **STOP**. You are diverging.
```

**Step 2: Verify**

Check file content manually.

**Step 3: Commit**

```bash
git add AGENTS.md
git commit -m "docs: enforce strict planning and anti-divergence rules"
```

### Task 2: Enhance Service Layer for Related Products

**Files:**
- Modify: `src/services/products.ts`
- Create: `src/services/products.test.ts` (if not exists, or append to it)

**Step 1: Write the failing test**

`src/services/products.test.ts`:
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getProductsByCategory } from './products'

// Mock Supabase client
const mockSelect = vi.fn()
const mockEq = vi.fn()
const mockNeq = vi.fn()
const mockLimit = vi.fn()
const mockOrder = vi.fn()

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: () => ({
      select: mockSelect.mockReturnThis(),
    })
  }
}))

describe('getProductsByCategory', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSelect.mockReturnValue({
      eq: mockEq.mockReturnThis(),
      neq: mockNeq.mockReturnThis(),
      limit: mockLimit.mockReturnThis(),
      order: mockOrder.mockReturnThis(),
      then: vi.fn().mockResolvedValue({ data: [], error: null })
    })
  })

  it('fetches products by category', async () => {
    await getProductsByCategory('Electronics')
    expect(mockEq).toHaveBeenCalledWith('category', 'Electronics')
  })

  it('excludes specific product ID', async () => {
    await getProductsByCategory('Electronics', { excludeId: '1' })
    expect(mockNeq).toHaveBeenCalledWith('id', '1')
  })

  it('limits the results', async () => {
    await getProductsByCategory('Electronics', { limit: 4 })
    expect(mockLimit).toHaveBeenCalledWith(4)
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npm run test src/services/products.test.ts`
Expected: FAIL (Type error: extra arguments not supported)

**Step 3: Write minimal implementation**

Modify `src/services/products.ts`:
```typescript
export interface RelatedProductsOptions {
  excludeId?: string
  limit?: number
}

export async function getProductsByCategory(
  category: string, 
  options?: RelatedProductsOptions
): Promise<Product[]> {
  const limit = options?.limit || 10
  
  // Handle Mock Data
  if (process.env.MOCK_DATA === 'true') {
     // ... existing mock logic with filter support ...
     // For brevity in plan, implement simplified mock logic here
     return [] 
  }

  let query = supabase
    .from('products')
    .select('*')
    .eq('category', category)
  
  if (options?.excludeId) {
    query = query.neq('id', options.excludeId)
  }
  
  query = query.limit(limit)
  
  const { data, error } = await query
  if (error) throw error
  return data || []
}
```

**Step 4: Run test to verify it passes**

Run: `npm run test src/services/products.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/services/products.ts src/services/products.test.ts
git commit -m "feat(services): add excludeId and limit to getProductsByCategory"
```

### Task 3: Implement SEO & SSG

**Files:**
- Modify: `src/app/products/[id]/page.tsx`
- Create: `e2e/pdp-seo.spec.ts`

**Step 1: Write E2E Test**

`e2e/pdp-seo.spec.ts`:
```typescript
import { test, expect } from '@playwright/test'

test('PDP has JSON-LD and correct metadata', async ({ page }) => {
  await page.goto('/')
  // Navigate to a product
  await page.locator('a[href^="/products/"]').first().click()
  
  // Check JSON-LD
  const jsonLd = page.locator('script[type="application/ld+json"]')
  await expect(jsonLd).toHaveCount(1)
  
  const content = await jsonLd.textContent()
  const data = JSON.parse(content || '{}')
  
  expect(data['@context']).toBe('https://schema.org')
  expect(data['@type']).toBe('Product')
  expect(data.name).toBeTruthy()
  expect(data.offers.price).toBeTruthy()
})
```

**Step 2: Run Test (Fail)**

Run: `npx playwright test e2e/pdp-seo.spec.ts`
Expected: FAIL

**Step 3: Implement generateStaticParams & JSON-LD**

Modify `src/app/products/[id]/page.tsx`:
- Add `generateStaticParams`.
- Inject JSON-LD `<script>`.

```typescript
import { getProducts } from '@/services/products'

// ... existing imports

export async function generateStaticParams() {
  const products = await getProducts()
  return products.map((product) => ({
    id: product.id,
  }))
}

export default async function ProductPage({ params }: { params: { id: string } }) {
  // ... existing fetch logic
  
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.image_url,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'USD',
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
  }

  return (
    <div className="min-h-screen bg-slate-50">
       <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* ... rest of the component */}
    </div>
  )
}
```

**Step 4: Run Test (Pass)**

Run: `npx playwright test e2e/pdp-seo.spec.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/app/products/[id]/page.tsx e2e/pdp-seo.spec.ts
git commit -m "feat(pdp): add JSON-LD and generateStaticParams"
```

### Task 4: Implement Loading & Error States

**Files:**
- Create: `src/components/ui/Skeleton.tsx`
- Create: `src/app/products/[id]/loading.tsx`
- Create: `src/app/products/[id]/error.tsx`

**Step 1: Create Skeleton Component**

`src/components/ui/Skeleton.tsx`:
```typescript
import { cn } from '@/lib/utils'

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("animate-pulse rounded-md bg-slate-200", className)} {...props} />
  )
}
```

**Step 2: Create loading.tsx**

`src/app/products/[id]/loading.tsx`:
```typescript
import { Skeleton } from "@/components/ui/Skeleton"

export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12 animate-pulse">
       <div className="grid md:grid-cols-2 gap-12">
        <Skeleton className="aspect-square rounded-2xl" />
        <div className="space-y-4">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-12 w-32" />
        </div>
      </div>
    </div>
  )
}
```

**Step 3: Create error.tsx**

`src/app/products/[id]/error.tsx`:
```typescript
'use client'

import { Button } from '@/components/ui/Button'

export default function Error({ reset }: { reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh]">
      <h2 className="text-2xl font-bold mb-4">出错了</h2>
      <Button onClick={() => reset()}>重试</Button>
    </div>
  )
}
```

**Step 4: Verify**

Run: `npm run build`
Expected: PASS

**Step 5: Commit**

```bash
git add src/components/ui/Skeleton.tsx src/app/products/[id]/loading.tsx src/app/products/[id]/error.tsx
git commit -m "feat(pdp): add loading skeleton and error boundary"
```

### Task 5: Related Products Section

**Files:**
- Modify: `src/app/products/[id]/page.tsx`
- Modify: `src/components/products/ProductGrid.tsx` (Reuse if existing, or create new list)

**Step 1: Implement Related Products in Page**

`src/app/products/[id]/page.tsx`:
```typescript
import { getProductById, getProductsByCategory } from '@/services/products'
import { ProductGrid } from '@/components/products/ProductGrid'

// ... 

export default async function ProductPage({ params }: { params: { id: string } }) {
  // ... get main product ...

  // Fetch related products
  const relatedProducts = await getProductsByCategory(product.category, { 
    excludeId: product.id, 
    limit: 4 
  })

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ... Header and Main Content ... */}
      
      {/* Add Related Products Section at bottom of main */}
      {relatedProducts.length > 0 && (
        <section className="mt-16 border-t pt-16">
          <h2 className="text-2xl font-bold text-slate-900 mb-8">相关商品</h2>
          <ProductGrid products={relatedProducts} />
        </section>
      )}
    </div>
  )
}
```

**Step 2: Verify Build & UI**

Run: `npm run build`
Manual Check: Navigate to a product page and see "Related Products".

**Step 3: Commit**

```bash
git add src/app/products/[id]/page.tsx
git commit -m "feat(pdp): add related products section"
```
