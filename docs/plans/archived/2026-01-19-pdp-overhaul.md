# PDP Overhaul & Direct Buy Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform the Product Detail Page (PDP) into a rich, high-performance sales page with dynamic attributes/variants (via JSONB) and a "Buy Now" flow.

**Architecture:**
- **Data Layer:** Add `metadata` (JSONB) to `products` table for flexible attributes/variants.
- **State Management:** Use Zustand (`useCheckoutStore`) with persistence to handle "Buy Now" state across page navigation.
- **Service Layer:** Update `getProducts` to parse/mock JSON metadata.
- **UI:** New PDP with Skeleton loading, dynamic Variant Selector, Attribute List, and Related Products.
- **Performance:** SSG (`generateStaticParams`) for instant loads.

**Tech Stack:** Next.js App Router, Supabase (PostgreSQL JSONB), Zustand, Tailwind CSS, Vitest, Playwright.

### Task 1: Database & Service Layer Upgrade

**Files:**
- Create: `supabase/migrations/20260119_add_product_metadata.sql` (if migrations dir exists, otherwise script in docs)
- Modify: `src/types/product.ts`
- Modify: `src/services/products.ts`
- Modify: `src/services/products.test.ts`

**Step 1: Define Type & Mock Data**

Modify `src/types/product.ts`:
```typescript
export interface ProductVariant {
  name: string // e.g., "Color"
  values: string[] // e.g., ["Red", "Blue"]
}

export interface ProductMetadata {
  features?: Record<string, string> // Key-value attributes e.g. { Material: "Cotton" }
  variants?: ProductVariant[]
}

export interface Product {
  // ... existing fields
  metadata?: ProductMetadata
}
```

**Step 2: Update Mock Data (Service)**

Modify `src/services/products.ts`:
- Update `MOCK_PRODUCTS` to include `metadata`.
- Example:
```typescript
{
  id: '1',
  name: 'iPhone 15 Pro',
  // ...
  metadata: {
    features: { "Chip": "A17 Pro", "Display": "6.1-inch" },
    variants: [
      { name: "Color", values: ["Natural Titanium", "Blue Titanium"] },
      { name: "Storage", values: ["128GB", "256GB"] }
    ]
  }
}
```

**Step 3: Update Service Test**

Modify `src/services/products.test.ts`:
- Add test case ensuring `metadata` is returned.

**Step 4: Verify Service**

Run: `npm run test src/services/products.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/types/product.ts src/services/products.ts src/services/products.test.ts
git commit -m "feat(core): add metadata support to product type and service"
```

### Task 2: Zustand Checkout Store

**Files:**
- Create: `src/store/checkout.ts`
- Create: `src/store/checkout.test.ts`

**Step 1: Write Store Test**

`src/store/checkout.test.ts`:
```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { useCheckoutStore } from './checkout'

describe('Checkout Store', () => {
  beforeEach(() => {
    useCheckoutStore.setState({ items: [] })
  })

  it('sets direct buy item', () => {
    const item = { productId: '1', quantity: 1, variants: { Color: 'Red' } }
    useCheckoutStore.getState().setDirectBuyItem(item)
    
    expect(useCheckoutStore.getState().directBuyItem).toEqual(item)
  })
})
```

**Step 2: Implement Store**

`src/store/checkout.ts`:
```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface DirectBuyItem {
  productId: string
  quantity: number
  variants?: Record<string, string>
}

interface CheckoutState {
  directBuyItem: DirectBuyItem | null
  setDirectBuyItem: (item: DirectBuyItem | null) => void
}

export const useCheckoutStore = create<CheckoutState>()(
  persist(
    (set) => ({
      directBuyItem: null,
      setDirectBuyItem: (item) => set({ directBuyItem: item }),
    }),
    { name: 'checkout-storage' }
  )
)
```

**Step 3: Verify Store**

Run: `npm run test src/store/checkout.test.ts`
Expected: PASS

**Step 4: Commit**

```bash
git add src/store/checkout.ts src/store/checkout.test.ts
git commit -m "feat(store): add checkout store for direct buy flow"
```

### Task 3: Rich PDP Components (UI)

**Files:**
- Create: `src/components/products/VariantSelector.tsx`
- Create: `src/components/products/ProductFeatures.tsx`
- Create: `src/components/products/ServiceBadges.tsx` (Static)
- Create: `src/components/products/BuyNowButton.tsx`

**Step 1: Create VariantSelector**

`src/components/products/VariantSelector.tsx`:
```typescript
import { ProductVariant } from '@/types/product'

interface Props {
  variants: ProductVariant[]
  selections: Record<string, string>
  onSelect: (name: string, value: string) => void
}

export function VariantSelector({ variants, selections, onSelect }: Props) {
  if (!variants?.length) return null
  
  return (
    <div className="space-y-4 mb-6">
      {variants.map((v) => (
        <div key={v.name}>
          <label className="block text-sm font-medium text-slate-700 mb-2">{v.name}</label>
          <div className="flex flex-wrap gap-2">
            {v.values.map((val) => (
              <button
                key={val}
                onClick={() => onSelect(v.name, val)}
                className={`px-3 py-1 border rounded-md text-sm ${
                  selections[v.name] === val 
                    ? 'border-primary-600 bg-primary-50 text-primary-700' 
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {val}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
```

**Step 2: Create BuyNowButton**

`src/components/products/BuyNowButton.tsx`:
```typescript
'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { useCheckoutStore } from '@/store/checkout'
import { Product } from '@/types/product'

interface Props {
  product: Product
  variants: Record<string, string>
  disabled?: boolean
}

export function BuyNowButton({ product, variants, disabled }: Props) {
  const router = useRouter()
  const setDirectBuyItem = useCheckoutStore((s) => s.setDirectBuyItem)

  const handleBuyNow = () => {
    setDirectBuyItem({
      productId: product.id,
      quantity: 1,
      variants
    })
    router.push('/checkout?source=direct')
  }

  return (
    <Button 
      onClick={handleBuyNow} 
      disabled={disabled}
      className="flex-1 bg-orange-600 hover:bg-orange-700"
    >
      立即购买
    </Button>
  )
}
```

**Step 3: Commit Components**

```bash
git add src/components/products/
git commit -m "feat(ui): add variant selector and buy now button"
```

### Task 4: PDP Integration & Optimization

**Files:**
- Modify: `src/app/products/[id]/page.tsx`
- Create: `src/app/products/[id]/ProductDetailClient.tsx` (Client Logic Wrapper)
- Create: `src/app/products/[id]/loading.tsx`

**Step 1: Create Client Wrapper**

Logic: Handle variant state and Buy Now interaction.
`src/app/products/[id]/ProductDetailClient.tsx`:
```typescript
'use client'

import { useState } from 'react'
import { Product } from '@/types/product'
import { VariantSelector } from '@/components/products/VariantSelector'
import { BuyNowButton } from '@/components/products/BuyNowButton'
import { AddToCartButton } from '@/components/products/AddToCartButton'

export function ProductDetailClient({ product }: { product: Product }) {
  const [selections, setSelections] = useState<Record<string, string>>({})
  
  // Auto-select first options
  // ... logic to init selections ...

  const isReady = product.metadata?.variants 
    ? product.metadata.variants.every(v => selections[v.name])
    : true

  return (
    <div>
       {/* Price & Title rendered by server component above */}
       
       <VariantSelector 
         variants={product.metadata?.variants || []}
         selections={selections}
         onSelect={(n, v) => setSelections(prev => ({ ...prev, [n]: v }))}
       />
       
       <div className="flex gap-4 mt-8">
         <AddToCartButton product={product} /> {/* Need to update to accept variants */}
         <BuyNowButton product={product} variants={selections} disabled={!isReady} />
       </div>
    </div>
  )
}
```

**Step 2: Update Page (Server)**

Modify `src/app/products/[id]/page.tsx`:
- Add `generateStaticParams`.
- Fetch `relatedProducts`.
- Render `ProductDetailClient`.
- Render `ProductFeatures` (Attributes table).

**Step 3: Add Loading Skeleton**

`src/app/products/[id]/loading.tsx`:
(As previously planned - skeleton UI)

**Step 4: Commit**

```bash
git add src/app/products/[id]/
git commit -m "feat(pdp): integrate client logic, SSG, and loading state"
```

### Task 5: Checkout Adaptation (Brief)

**Files:**
- Modify: `src/app/checkout/page.tsx`

**Step 1: Handle Direct Buy Source**

Modify `src/app/checkout/page.tsx`:
- Check `searchParams.source === 'direct'`.
- If direct, read `useCheckoutStore`.
- If normal, read `useCartStore`.

**Step 2: Commit**

```bash
git add src/app/checkout/page.tsx
git commit -m "feat(checkout): support direct buy mode"
```

### Task 6: E2E Verification

**Files:**
- Create: `e2e/buy-now.spec.ts`

**Step 1: Write Test**

```typescript
import { test, expect } from '@playwright/test'

test('Buy Now flow with variants', async ({ page }) => {
  await page.goto('/products/1') // iPhone
  
  // Select variant if exists
  const colorBtn = page.getByRole('button', { name: 'Natural Titanium' })
  if (await colorBtn.isVisible()) {
    await colorBtn.click()
  }

  // Click Buy Now
  await page.getByText('立即购买').click()
  
  // Expect Checkout
  await expect(page).toHaveURL(/checkout\?source=direct/)
  
  // Expect Item in Summary
  await expect(page.getByText('iPhone 15 Pro')).toBeVisible()
})
```

**Step 2: Run & Verify**

Run: `npx playwright test e2e/buy-now.spec.ts`
Expected: PASS

**Step 3: Commit**

```bash
git add e2e/buy-now.spec.ts
git commit -m "test(e2e): verify buy now flow"
```
