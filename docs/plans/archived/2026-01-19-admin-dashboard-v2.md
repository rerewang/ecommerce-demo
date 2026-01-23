# Admin Dashboard 2.0 & Layout Refactor Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Refactor application layout into Route Groups for better separation of concerns, and build a feature-rich Admin Dashboard for Product and Order management.

**Architecture:**
- **Layout**: Split into `(shop)` (public) and `(admin)` (private) route groups.
- **Admin Features**:
    - **Products**: Full CRUD with visual `MetadataEditor` for dynamic attributes.
    - **Orders**: Status management workflow.
- **Tech Stack**: Next.js App Router (Route Groups), Server Actions, React Hook Form + Zod, Tailwind CSS.

### Task 1: Route Group Refactoring (Layouts)

**Files:**
- Move: `src/app/*` to `src/app/(shop)/*` (except api, layout, global.css)
- Move: `src/app/admin` to `src/app/(admin)/admin`
- Create: `src/app/(shop)/layout.tsx`
- Create: `src/app/(admin)/layout.tsx`
- Modify: `src/app/layout.tsx`

**Step 1: Create Route Group Directories**

```bash
mkdir -p src/app/\(shop\)
mkdir -p src/app/\(admin\)
```

**Step 2: Move Shop Pages**

Move the following into `src/app/(shop)/`:
- `page.tsx`
- `products/`
- `cart/`
- `orders/`
- `checkout/`
- `login/`

**Step 3: Move Admin Pages**

Move `src/app/admin` contents into `src/app/(admin)/admin`.
*Note: We might rename `src/app/(admin)/admin` to `src/app/(admin)/dashboard` later, but for now let's keep path stability or just map it.*
Actually, better structure: `src/app/(admin)/admin` -> `src/app/(admin)/admin`. The URL remains `/admin`.

**Step 4: Create Shop Layout**

`src/app/(shop)/layout.tsx`:
```typescript
import { Header } from '@/components/layout/Header'

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-slate-50 pb-20">
        {children}
      </main>
    </>
  )
}
```

**Step 5: Create Admin Layout**

`src/app/(admin)/layout.tsx`:
```typescript
import Link from 'next/link'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white min-h-screen fixed left-0 top-0 overflow-y-auto">
        <div className="p-6">
          <h1 className="text-xl font-bold">Admin Panel</h1>
        </div>
        <nav className="mt-6 px-4 space-y-2">
          <Link href="/admin" className="block px-4 py-2 rounded hover:bg-slate-800">Dashboard</Link>
          <Link href="/admin/products" className="block px-4 py-2 rounded hover:bg-slate-800">Products</Link>
          <Link href="/admin/orders" className="block px-4 py-2 rounded hover:bg-slate-800">Orders</Link>
          <Link href="/" className="block px-4 py-2 rounded hover:bg-slate-800 mt-8 text-slate-400 text-sm">Back to Shop</Link>
        </nav>
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        {children}
      </main>
    </div>
  )
}
```

**Step 6: Clean Root Layout**

Modify `src/app/layout.tsx` to remove any Shop specific styling if present, leaving just html/body providers.

**Step 7: Verify Build**

Run: `npm run build`
Expected: PASS (Next.js handles route groups automatically).

**Step 8: Commit**

```bash
git add src/app/
git commit -m "refactor(layout): implement route groups for shop and admin separation"
```

### Task 2: Metadata Editor Components

**Files:**
- Create: `src/components/admin/MetadataEditor.tsx`
- Create: `src/components/admin/MetadataEditor.test.tsx`

**Step 1: Write Test**

`src/components/admin/MetadataEditor.test.tsx`:
```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { MetadataEditor } from './MetadataEditor'
import { vi } from 'vitest'

test('adds a new feature', () => {
  const onChange = vi.fn()
  render(<MetadataEditor value={{}} onChange={onChange} />)
  
  fireEvent.click(screen.getByText('添加属性'))
  
  // Expect inputs to appear
  expect(screen.getAllByRole('textbox')).toHaveLength(2) // Key and Value
})
```

**Step 2: Implement Component**

`src/components/admin/MetadataEditor.tsx`:
```typescript
'use client'

import { useState, useEffect } from 'react'
import { ProductMetadata } from '@/types/product'
import { Button } from '@/components/ui/Button'
import { Plus, Trash2 } from 'lucide-react'

interface Props {
  value?: ProductMetadata
  onChange: (value: ProductMetadata) => void
}

export function MetadataEditor({ value = {}, onChange }: Props) {
  // Local state for form fields, synced to props
  // Implement Features (Key-Value) editor
  // Implement Variants (Name-Tags) editor
  // Implement JSON fallback details
  
  const addFeature = () => {
    const newFeatures = { ...value.features, '': '' }
    onChange({ ...value, features: newFeatures })
  }

  // ... implementation details ...
  return (
    <div className="space-y-6 border p-4 rounded-lg bg-white">
      {/* Features UI */}
      {/* Variants UI */}
    </div>
  )
}
```
*Note: For the plan, implement a basic functional version covering Features and Variants.*

**Step 3: Run Test**

Run: `npm run test src/components/admin/MetadataEditor.test.tsx`
Expected: PASS

**Step 4: Commit**

```bash
git add src/components/admin/
git commit -m "feat(admin): add metadata editor component"
```

### Task 3: Product Edit Page & Actions

**Files:**
- Create: `src/app/(admin)/admin/products/[id]/page.tsx`
- Create: `src/app/(admin)/admin/products/new/page.tsx` (Reuse form)
- Create: `src/components/admin/ProductForm.tsx`
- Modify: `src/services/products.ts` (Ensure create/update support metadata)

**Step 1: Create ProductForm**

`src/components/admin/ProductForm.tsx`:
- Use `react-hook-form` or controlled inputs.
- Include standard fields (Name, Price, etc.).
- Embed `MetadataEditor`.
- Handle Submit -> Call Server Action (or Service).

**Step 2: Create Server Actions/Service**

Ensure `src/services/products.ts` functions `createProduct` and `updateProduct` correctly pass `metadata` to Supabase. (They should already, as they take `Partial<Product>`).

**Step 3: Create Edit Page**

`src/app/(admin)/admin/products/[id]/page.tsx`:
- Fetch product by ID.
- Render `ProductForm` with initial data.

**Step 4: Create New Page**

`src/app/(admin)/admin/products/new/page.tsx`:
- Render `ProductForm` empty.

**Step 5: Verify Manual**

Navigate to `/admin/products/new`.

**Step 6: Commit**

```bash
git add src/app/\(admin\)/admin/products/ src/components/admin/ProductForm.tsx
git commit -m "feat(admin): add product create/edit pages with metadata support"
```

### Task 4: Order Management Enhancement

**Files:**
- Modify: `src/app/(admin)/admin/orders/page.tsx` (List)
- Create: `src/components/admin/OrderStatusSelect.tsx`

**Step 1: Create Status Selector**

`src/components/admin/OrderStatusSelect.tsx`:
- Dropdown with statuses: 'pending', 'paid', 'shipped', 'completed', 'cancelled'.
- On Change -> Call `updateOrderStatus`.

**Step 2: Update Order List**

`src/app/(admin)/admin/orders/page.tsx`:
- Add the `OrderStatusSelect` to each row (or detail view).

**Step 3: Commit**

```bash
git add src/app/\(admin\)/admin/orders/ src/components/admin/
git commit -m "feat(admin): enable order status management"
```
