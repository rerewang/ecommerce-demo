# E-commerce MVP Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a production-ready Next.js e-commerce demo with product listing, detail pages, shopping cart, and admin panel.

**Architecture:** App Router architecture with server components for data fetching, client components for interactivity, Zustand for cart state, Supabase PostgreSQL for backend, Tailwind CSS with custom design system (Soft UI Evolution).

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS, Supabase, Zustand, Lucide React

---

## Task 1: Supabase Setup & Database Connection

**Files:**
- Create: `src/lib/supabase.ts`
- Create: `.env.local`
- Modify: `.gitignore`

**Step 1: Create Supabase client**

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      products: {
        Row: {
          id: string
          name: string
          description: string
          price: number
          image_url: string
          stock: number
          category: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['products']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['products']['Insert']>
      }
    }
  }
}
```

**Step 2: Create environment file template**

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

**Step 3: Update .gitignore**

Add to `.gitignore`:
```
.env*.local
```

**Step 4: Manual action - Get Supabase credentials**

Action: User creates Supabase project and adds credentials to `.env.local`
Verification: Credentials file exists and contains valid URL/key

**Step 5: Commit**

```bash
git add src/lib/supabase.ts .gitignore
git commit -m "feat: add Supabase client configuration"
```

---

## Task 2: Database Schema Creation

**Files:**
- Create: `supabase/schema.sql` (for reference)

**Step 1: Create schema SQL file**

```sql
-- supabase/schema.sql
-- Products table
create table products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text not null,
  price numeric(10,2) not null check (price >= 0),
  image_url text not null,
  stock integer not null default 0 check (stock >= 0),
  category text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add RLS policies
alter table products enable row level security;

-- Allow public read access
create policy "Products are viewable by everyone"
  on products for select
  using (true);

-- Allow authenticated users to insert (for admin)
create policy "Authenticated users can insert products"
  on products for insert
  with check (auth.role() = 'authenticated');

-- Allow authenticated users to update (for admin)
create policy "Authenticated users can update products"
  on products for update
  using (auth.role() = 'authenticated');

-- Allow authenticated users to delete (for admin)
create policy "Authenticated users can delete products"
  on products for delete
  using (auth.role() = 'authenticated');

-- Insert sample data
insert into products (name, description, price, image_url, stock, category) values
  ('iPhone 15 Pro', 'Latest flagship with A17 Pro chip', 999.00, 'https://images.unsplash.com/photo-1696446702780-1fdbb930c672?w=400', 50, 'Electronics'),
  ('MacBook Pro 16"', 'M3 Max processor, 32GB RAM', 2499.00, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400', 30, 'Electronics'),
  ('AirPods Pro', 'Active noise cancellation', 249.00, 'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=400', 100, 'Electronics'),
  ('iPad Air', '10.9-inch Liquid Retina display', 599.00, 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400', 75, 'Electronics'),
  ('Apple Watch Series 9', 'Advanced health monitoring', 399.00, 'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=400', 60, 'Wearables'),
  ('Magic Keyboard', 'Wireless keyboard with numeric keypad', 129.00, 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400', 120, 'Accessories');
```

**Step 2: Manual action - Execute SQL in Supabase**

Action: User runs SQL in Supabase SQL Editor
Verification: Query succeeds, table created, sample data inserted

**Step 3: Verify connection**

Test in `src/app/page.tsx`:
```typescript
import { supabase } from '@/lib/supabase'

export default async function Home() {
  const { data, error } = await supabase.from('products').select('*').limit(1)
  console.log('DB Test:', { data, error })
  return <div>Check console for DB connection</div>
}
```

Run: `npm run dev` and visit http://localhost:3000
Expected: Console shows product data, no errors

**Step 4: Commit**

```bash
git add supabase/schema.sql
git commit -m "feat: add products table schema and sample data"
```

---

## Task 3: Product Type Definitions & API Service

**Files:**
- Create: `src/types/product.ts`
- Create: `src/services/products.ts`

**Step 1: Create product types**

```typescript
// src/types/product.ts
export interface Product {
  id: string
  name: string
  description: string
  price: number
  image_url: string
  stock: number
  category: string
  created_at: string
}

export type CreateProductInput = Omit<Product, 'id' | 'created_at'>
export type UpdateProductInput = Partial<CreateProductInput>
```

**Step 2: Create products service**

```typescript
// src/services/products.ts
import { supabase } from '@/lib/supabase'
import type { Product, CreateProductInput, UpdateProductInput } from '@/types/product'

export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data || []
}

export async function getProductById(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('category', category)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data || []
}

export async function createProduct(input: CreateProductInput): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .insert(input)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updateProduct(id: string, input: UpdateProductInput): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .update(input)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}
```

**Step 3: Verify TypeScript compilation**

Run: `npm run build`
Expected: No TypeScript errors

**Step 4: Commit**

```bash
git add src/types/product.ts src/services/products.ts
git commit -m "feat: add product types and API service layer"
```

---

## Task 4: Base UI Components - Button

**Files:**
- Create: `src/components/ui/Button.tsx`

**Step 1: Create Button component**

```typescript
// src/components/ui/Button.tsx
import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          // Base styles
          'inline-flex items-center justify-center font-medium transition-all duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          // Soft UI Evolution shadows
          'shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)]',
          'active:shadow-[0_1px_4px_rgba(0,0,0,0.06)]',
          
          // Variants
          {
            'bg-primary-500 text-white hover:bg-primary-600': variant === 'primary',
            'bg-slate-100 text-slate-900 hover:bg-slate-200': variant === 'secondary',
            'border-2 border-primary-500 text-primary-500 hover:bg-primary-50': variant === 'outline',
            'text-slate-700 hover:bg-slate-100 shadow-none': variant === 'ghost',
          },
          
          // Sizes
          {
            'text-sm px-3 py-1.5 rounded-md': size === 'sm',
            'text-base px-4 py-2 rounded-lg': size === 'md',
            'text-lg px-6 py-3 rounded-xl': size === 'lg',
          },
          
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
```

**Step 2: Test Button in home page**

Add to `src/app/page.tsx`:
```typescript
import { Button } from '@/components/ui/Button'

export default function Home() {
  return (
    <div className="p-8 space-y-4">
      <Button variant="primary">Primary Button</Button>
      <Button variant="secondary">Secondary Button</Button>
      <Button variant="outline">Outline Button</Button>
      <Button variant="ghost">Ghost Button</Button>
    </div>
  )
}
```

Run: `npm run dev` and visit http://localhost:3000
Expected: See 4 buttons with different styles, soft shadows, smooth hover transitions

**Step 3: Verify TypeScript**

Run: `npm run build`
Expected: No errors

**Step 4: Commit**

```bash
git add src/components/ui/Button.tsx
git commit -m "feat: add Button component with Soft UI Evolution design"
```

---

## Task 5: Base UI Components - Card

**Files:**
- Create: `src/components/ui/Card.tsx`

**Step 1: Create Card component**

```typescript
// src/components/ui/Card.tsx
import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, hover = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'bg-white rounded-xl border border-slate-200',
          // Soft UI Evolution shadows
          'shadow-[0_2px_8px_rgba(0,0,0,0.08)]',
          hover && 'transition-all duration-300 hover:shadow-[0_8px_16px_rgba(0,0,0,0.12)] hover:-translate-y-1',
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('p-6 pb-4', className)}
        {...props}
      />
    )
  }
)

CardHeader.displayName = 'CardHeader'

export const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => {
    return (
      <h3
        ref={ref}
        className={cn('font-heading text-xl font-semibold text-slate-900', className)}
        {...props}
      />
    )
  }
)

CardTitle.displayName = 'CardTitle'

export const CardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={cn('text-sm text-slate-600 mt-1', className)}
        {...props}
      />
    )
  }
)

CardDescription.displayName = 'CardDescription'

export const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('p-6 pt-0', className)}
        {...props}
      />
    )
  }
)

CardContent.displayName = 'CardContent'

export const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('p-6 pt-0 flex items-center', className)}
        {...props}
      />
    )
  }
)

CardFooter.displayName = 'CardFooter'
```

**Step 2: Test Card in home page**

Update `src/app/page.tsx`:
```typescript
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export default function Home() {
  return (
    <div className="p-8 max-w-md">
      <Card hover>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card description goes here</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-slate-700">This is the card content area.</p>
        </CardContent>
        <CardFooter>
          <Button variant="primary">Action</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
```

Run: `npm run dev` and visit http://localhost:3000
Expected: See card with soft shadow, smooth hover effect (lifts up)

**Step 3: Verify TypeScript**

Run: `npm run build`
Expected: No errors

**Step 4: Commit**

```bash
git add src/components/ui/Card.tsx
git commit -m "feat: add Card component with Soft UI Evolution design"
```

---

## Task 6: Base UI Components - Input

**Files:**
- Create: `src/components/ui/Input.tsx`

**Step 1: Create Input component**

```typescript
// src/components/ui/Input.tsx
import { InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, type = 'text', ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          'w-full px-4 py-2 rounded-lg border transition-all duration-200',
          'font-body text-base text-slate-900 placeholder:text-slate-400',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          // Soft UI Evolution shadows
          'shadow-[inset_0_1px_3px_rgba(0,0,0,0.06)]',
          'focus-visible:shadow-[inset_0_1px_3px_rgba(0,0,0,0.06),0_0_0_3px_rgba(135,206,235,0.1)]',
          
          // States
          error
            ? 'border-red-300 focus-visible:ring-red-500 focus-visible:border-red-500'
            : 'border-slate-200 focus-visible:ring-primary-500 focus-visible:border-primary-500',
          
          className
        )}
        {...props}
      />
    )
  }
)

Input.displayName = 'Input'
```

**Step 2: Test Input in home page**

Update `src/app/page.tsx`:
```typescript
import { Input } from '@/components/ui/Input'

export default function Home() {
  return (
    <div className="p-8 max-w-md space-y-4">
      <Input placeholder="Normal input" />
      <Input placeholder="Error state" error />
      <Input placeholder="Disabled" disabled />
    </div>
  )
}
```

Run: `npm run dev` and visit http://localhost:3000
Expected: See 3 inputs with inset shadows, smooth focus transitions

**Step 3: Verify TypeScript**

Run: `npm run build`
Expected: No errors

**Step 4: Commit**

```bash
git add src/components/ui/Input.tsx
git commit -m "feat: add Input component with Soft UI Evolution design"
```

---

## Task 7: Cart Store with Zustand

**Files:**
- Create: `src/store/cart.ts`

**Step 1: Create cart store**

```typescript
// src/store/cart.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Product } from '@/types/product'

export interface CartItem {
  product: Product
  quantity: number
}

interface CartStore {
  items: CartItem[]
  addItem: (product: Product, quantity?: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  getTotalPrice: () => number
  getTotalItems: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (product, quantity = 1) => {
        set((state) => {
          const existingItem = state.items.find(item => item.product.id === product.id)
          
          if (existingItem) {
            return {
              items: state.items.map(item =>
                item.product.id === product.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              )
            }
          }
          
          return {
            items: [...state.items, { product, quantity }]
          }
        })
      },
      
      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter(item => item.product.id !== productId)
        }))
      },
      
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId)
          return
        }
        
        set((state) => ({
          items: state.items.map(item =>
            item.product.id === productId
              ? { ...item, quantity }
              : item
          )
        }))
      },
      
      clearCart: () => {
        set({ items: [] })
      },
      
      getTotalPrice: () => {
        return get().items.reduce((total, item) => {
          return total + (item.product.price * item.quantity)
        }, 0)
      },
      
      getTotalItems: () => {
        return get().items.reduce((total, item) => {
          return total + item.quantity
        }, 0)
      }
    }),
    {
      name: 'cart-storage'
    }
  )
)
```

**Step 2: Test cart store**

Create test file `src/app/test-cart/page.tsx`:
```typescript
'use client'

import { useCartStore } from '@/store/cart'
import { Button } from '@/components/ui/Button'

export default function TestCartPage() {
  const { items, addItem, removeItem, getTotalPrice, getTotalItems } = useCartStore()
  
  const testProduct = {
    id: '1',
    name: 'Test Product',
    description: 'Test',
    price: 99.99,
    image_url: '',
    stock: 10,
    category: 'Test',
    created_at: new Date().toISOString()
  }
  
  return (
    <div className="p-8">
      <Button onClick={() => addItem(testProduct)}>Add Test Product</Button>
      <div className="mt-4">
        <p>Total Items: {getTotalItems()}</p>
        <p>Total Price: ${getTotalPrice().toFixed(2)}</p>
        <ul>
          {items.map(item => (
            <li key={item.product.id}>
              {item.product.name} x {item.quantity}
              <Button size="sm" onClick={() => removeItem(item.product.id)}>Remove</Button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
```

Run: `npm run dev` and visit http://localhost:3000/test-cart
Expected: Can add/remove items, totals update, persists on refresh

**Step 3: Verify TypeScript**

Run: `npm run build`
Expected: No errors

**Step 4: Remove test page and commit**

```bash
rm -rf src/app/test-cart
git add src/store/cart.ts
git commit -m "feat: add cart store with Zustand and persistence"
```

---

## Task 8: Product Card Component

**Files:**
- Create: `src/components/products/ProductCard.tsx`

**Step 1: Create ProductCard component**

```typescript
// src/components/products/ProductCard.tsx
'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'
import { Card, CardContent, CardFooter } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useCartStore } from '@/store/cart'
import { formatCurrency } from '@/lib/utils'
import type { Product } from '@/types/product'

export interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore(state => state.addItem)
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault() // Prevent navigation when clicking button
    addItem(product)
  }
  
  return (
    <Link href={`/products/${product.id}`}>
      <Card hover className="h-full flex flex-col">
        <div className="relative aspect-square overflow-hidden rounded-t-xl">
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>
        
        <CardContent className="flex-1 flex flex-col pt-4">
          <div className="mb-2">
            <span className="inline-block px-2 py-1 text-xs font-medium bg-primary-50 text-primary-600 rounded-md">
              {product.category}
            </span>
          </div>
          
          <h3 className="font-heading text-lg font-semibold text-slate-900 mb-2">
            {product.name}
          </h3>
          
          <p className="text-sm text-slate-600 line-clamp-2 mb-4">
            {product.description}
          </p>
          
          <div className="mt-auto">
            <p className="font-heading text-2xl font-bold text-primary-600">
              {formatCurrency(product.price)}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              库存: {product.stock}
            </p>
          </div>
        </CardContent>
        
        <CardFooter>
          <Button
            variant="primary"
            className="w-full"
            onClick={handleAddToCart}
            disabled={product.stock === 0}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            {product.stock > 0 ? '加入购物车' : '已售罄'}
          </Button>
        </CardFooter>
      </Card>
    </Link>
  )
}
```

**Step 2: Verify TypeScript**

Run: `npm run build`
Expected: No errors

**Step 3: Commit**

```bash
git add src/components/products/ProductCard.tsx
git commit -m "feat: add ProductCard component with cart integration"
```

---

## Task 9: Product Grid Component

**Files:**
- Create: `src/components/products/ProductGrid.tsx`

**Step 1: Create ProductGrid component**

```typescript
// src/components/products/ProductGrid.tsx
import type { Product } from '@/types/product'
import { ProductCard } from './ProductCard'

export interface ProductGridProps {
  products: Product[]
  emptyMessage?: string
}

export function ProductGrid({ products, emptyMessage = '暂无商品' }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-500 text-lg">{emptyMessage}</p>
      </div>
    )
  }
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
```

**Step 2: Verify TypeScript**

Run: `npm run build`
Expected: No errors

**Step 3: Commit**

```bash
git add src/components/products/ProductGrid.tsx
git commit -m "feat: add ProductGrid component with responsive layout"
```

---

## Task 10: Products Listing Page

**Files:**
- Modify: `src/app/page.tsx`
- Create: `src/app/layout.tsx` (update with fonts)

**Step 1: Update root layout with fonts**

```typescript
// src/app/layout.tsx
import type { Metadata } from "next";
import { Poppins, Open_Sans } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-poppins',
  display: 'swap',
})

const openSans = Open_Sans({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-open-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: "电商 Demo - Next.js E-commerce",
  description: "现代化电商演示项目，使用 Next.js + Supabase 构建",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={`${poppins.variable} ${openSans.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
```

**Step 2: Create products listing page**

```typescript
// src/app/page.tsx
import { getProducts } from '@/services/products'
import { ProductGrid } from '@/components/products/ProductGrid'

export default async function HomePage() {
  const products = await getProducts()
  
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="font-heading text-3xl font-bold text-slate-900">
            电商 Demo
          </h1>
          <p className="text-slate-600 mt-1">
            精选商品，优质体验
          </p>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProductGrid products={products} />
      </main>
    </div>
  )
}
```

**Step 3: Test page**

Run: `npm run dev` and visit http://localhost:3000
Expected: See grid of products from Supabase, responsive layout (1/2/3/4 columns), hover effects work

**Step 4: Verify build**

Run: `npm run build`
Expected: No errors, static generation succeeds

**Step 5: Commit**

```bash
git add src/app/page.tsx src/app/layout.tsx
git commit -m "feat: add products listing page with server components"
```

---

## Task 11: Product Detail Page

**Files:**
- Create: `src/app/products/[id]/page.tsx`

**Step 1: Create product detail page**

```typescript
// src/app/products/[id]/page.tsx
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { getProductById } from '@/services/products'
import { AddToCartButton } from '@/components/products/AddToCartButton'
import { formatCurrency } from '@/lib/utils'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await getProductById(params.id)
  
  if (!product) {
    notFound()
  }
  
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回商品列表
            </Button>
          </Link>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-white shadow-lg">
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          
          {/* Product Info */}
          <div className="flex flex-col">
            <div className="mb-4">
              <span className="inline-block px-3 py-1 text-sm font-medium bg-primary-50 text-primary-600 rounded-lg">
                {product.category}
              </span>
            </div>
            
            <h1 className="font-heading text-4xl font-bold text-slate-900 mb-4">
              {product.name}
            </h1>
            
            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
              {product.description}
            </p>
            
            <div className="mb-8">
              <p className="text-sm text-slate-500 mb-2">价格</p>
              <p className="font-heading text-5xl font-bold text-primary-600">
                {formatCurrency(product.price)}
              </p>
            </div>
            
            <div className="mb-8 p-4 bg-slate-100 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-slate-700">库存状态</span>
                <span className={`font-medium ${product.stock > 0 ? 'text-success' : 'text-red-500'}`}>
                  {product.stock > 0 ? `${product.stock} 件可售` : '已售罄'}
                </span>
              </div>
            </div>
            
            <AddToCartButton product={product} />
          </div>
        </div>
      </main>
    </div>
  )
}
```

**Step 2: Create AddToCartButton client component**

```typescript
// src/components/products/AddToCartButton.tsx
'use client'

import { useState } from 'react'
import { ShoppingCart, Check } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useCartStore } from '@/store/cart'
import type { Product } from '@/types/product'

export interface AddToCartButtonProps {
  product: Product
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const [added, setAdded] = useState(false)
  const addItem = useCartStore(state => state.addItem)
  
  const handleAddToCart = () => {
    addItem(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }
  
  return (
    <Button
      variant="primary"
      size="lg"
      className="w-full"
      onClick={handleAddToCart}
      disabled={product.stock === 0 || added}
    >
      {added ? (
        <>
          <Check className="w-5 h-5 mr-2" />
          已添加到购物车
        </>
      ) : (
        <>
          <ShoppingCart className="w-5 h-5 mr-2" />
          {product.stock > 0 ? '加入购物车' : '已售罄'}
        </>
      )}
    </Button>
  )
}
```

**Step 3: Create not-found page**

```typescript
// src/app/products/[id]/not-found.tsx
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default function ProductNotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="font-heading text-4xl font-bold text-slate-900 mb-4">
          商品未找到
        </h1>
        <p className="text-slate-600 mb-8">
          抱歉，该商品不存在或已下架
        </p>
        <Link href="/">
          <Button variant="primary">返回首页</Button>
        </Link>
      </div>
    </div>
  )
}
```

**Step 4: Test product detail page**

Run: `npm run dev` and click any product card
Expected: Navigate to detail page, see large image, description, price, add to cart button works

**Step 5: Verify build**

Run: `npm run build`
Expected: No errors

**Step 6: Commit**

```bash
git add src/app/products src/components/products/AddToCartButton.tsx
git commit -m "feat: add product detail page with dynamic routing"
```

---

## Task 12: Header with Cart Badge

**Files:**
- Create: `src/components/layout/Header.tsx`
- Create: `src/components/cart/CartBadge.tsx`

**Step 1: Create CartBadge component**

```typescript
// src/components/cart/CartBadge.tsx
'use client'

import { ShoppingCart } from 'lucide-react'
import { useCartStore } from '@/store/cart'

export function CartBadge() {
  const totalItems = useCartStore(state => state.getTotalItems())
  
  return (
    <button className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors">
      <ShoppingCart className="w-6 h-6 text-slate-700" />
      {totalItems > 0 && (
        <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
          {totalItems > 99 ? '99+' : totalItems}
        </span>
      )}
    </button>
  )
}
```

**Step 2: Create Header component**

```typescript
// src/components/layout/Header.tsx
import Link from 'next/link'
import { CartBadge } from '@/components/cart/CartBadge'

export function Header() {
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
            <Link
              href="/admin"
              className="text-slate-700 hover:text-slate-900 font-medium transition-colors"
            >
              管理后台
            </Link>
            <CartBadge />
          </nav>
        </div>
      </div>
    </header>
  )
}
```

**Step 3: Update pages to use Header**

Update `src/app/page.tsx`:
```typescript
import { getProducts } from '@/services/products'
import { ProductGrid } from '@/components/products/ProductGrid'
import { Header } from '@/components/layout/Header'

export default async function HomePage() {
  const products = await getProducts()
  
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="font-heading text-3xl font-bold text-slate-900 mb-2">
            精选商品
          </h2>
          <p className="text-slate-600">
            优质体验，安心购物
          </p>
        </div>
        
        <ProductGrid products={products} />
      </main>
    </div>
  )
}
```

Update `src/app/products/[id]/page.tsx` to use Header instead of local header.

**Step 4: Test header**

Run: `npm run dev`, add products to cart
Expected: Cart badge updates in real-time, header is sticky

**Step 5: Verify build**

Run: `npm run build`
Expected: No errors

**Step 6: Commit**

```bash
git add src/components/layout/Header.tsx src/components/cart/CartBadge.tsx src/app/page.tsx src/app/products/[id]/page.tsx
git commit -m "feat: add Header component with cart badge"
```

---

## Execution Handoff

Plan complete and saved to `docs/plans/2025-01-14-ecommerce-mvp.md`.

**Two execution options:**

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

**Which approach?**
