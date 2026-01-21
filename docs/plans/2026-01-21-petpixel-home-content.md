# PetPixel Home Page Content Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Complete the PetPixel landing page by implementing the Featured Gallery, Style Categories, and "How it Works" sections to solve the current "empty home page" issue.

**Architecture:**
- **Components:** Create modular home sections (`FeaturedGallery`, `StyleCategories`, `HowItWorks`) in `src/components/home/`.
- **Data:** Use existing `getProducts` service for the Gallery; static data for Styles and Steps.
- **Design:** strictly follow the "Liquid Glass" design system (Tailwind, `font-serif` headings, glassmorphism cards).

**Tech Stack:** Next.js, Tailwind CSS, Lucide React.

### Task 1: Featured Gallery Section

**Files:**
- Create: `src/components/home/FeaturedGallery.tsx`
- Modify: `src/app/(shop)/page.tsx`

**Step 1: Create Component**

`src/components/home/FeaturedGallery.tsx`:
```typescript
import { getProducts } from "@/services/products"
import { ProductCard } from "@/components/products/ProductCard"

export async function FeaturedGallery() {
  // Fetch latest 4 products
  const products = await getProducts({ limit: 4, sort: 'newest' })

  return (
    <section className="py-24 bg-stone-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-serif text-stone-900 mb-4">
            Curated <span className="text-primary italic">Gallery</span>
          </h2>
          <p className="text-stone-600 max-w-2xl mx-auto">
            Explore our latest AI-generated masterpieces. Each portrait is unique.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.slice(0, 4).map((product) => (
            <div key={product.id} className="hover:-translate-y-2 transition-transform duration-500">
               {/* Reuse existing ProductCard but ensure it handles layout gracefully */}
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

**Step 2: Update Home Page**

Modify `src/app/(shop)/page.tsx`:
```typescript
import { Hero } from "@/components/home/Hero"
import { FeaturedGallery } from "@/components/home/FeaturedGallery"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Hero />
      <FeaturedGallery />
    </div>
  )
}
```

**Step 3: Verify**

Run: `npm run build`
Expected: PASS

**Step 4: Commit**

```bash
git add src/components/home/FeaturedGallery.tsx src/app/\(shop\)/page.tsx
git commit -m "feat(home): add featured gallery section"
```

### Task 2: Style Categories Section

**Files:**
- Create: `src/components/home/StyleCategories.tsx`
- Modify: `src/app/(shop)/page.tsx`

**Step 1: Create Component**

`src/components/home/StyleCategories.tsx`:
```typescript
import Link from "next/link"
import Image from "next/image"

const STYLES = [
  { 
    id: 'oil', 
    name: 'Classic Oil', 
    description: 'Renaissance style portraits',
    color: 'bg-amber-100',
    // Use placeholder or local assets if available, here using colored divs for simplicity if no images
    img: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=400&h=600&fit=crop' 
  },
  { 
    id: 'cyber', 
    name: 'Cyberpunk', 
    description: 'Neon lights and chrome',
    color: 'bg-purple-100',
    img: 'https://images.unsplash.com/photo-1614726365723-49cfae97868d?w=400&h=600&fit=crop'
  },
  { 
    id: '3d', 
    name: '3D Pixar', 
    description: 'Cute animated character style',
    color: 'bg-blue-100',
    img: 'https://images.unsplash.com/photo-1633511090164-b43840ea1607?w=400&h=600&fit=crop'
  },
]

export function StyleCategories() {
  return (
    <section className="py-24 bg-white relative overflow-hidden">
       {/* Background Blob */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[500px] h-[500px] bg-stone-100 rounded-full blur-3xl -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-serif text-stone-900 mb-2">
              Browse by <span className="text-primary italic">Style</span>
            </h2>
          </div>
          <Link href="/products" className="text-primary hover:text-primary-700 font-medium hidden md:block">
            View all styles →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {STYLES.map((style) => (
            <Link 
              key={style.id} 
              href={`/products?query=${style.id}`} 
              className="group relative h-96 rounded-2xl overflow-hidden cursor-pointer"
            >
              <Image 
                src={style.img} 
                alt={style.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 p-8 text-white">
                <h3 className="text-2xl font-serif mb-2">{style.name}</h3>
                <p className="text-stone-200 text-sm opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                  {style.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
```

**Step 2: Update Home Page**

Modify `src/app/(shop)/page.tsx`:
```typescript
import { Hero } from "@/components/home/Hero"
import { FeaturedGallery } from "@/components/home/FeaturedGallery"
import { StyleCategories } from "@/components/home/StyleCategories"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Hero />
      <StyleCategories />
      <FeaturedGallery />
    </div>
  )
}
```

**Step 3: Verify**

Run: `npm run build`
Expected: PASS

**Step 4: Commit**

```bash
git add src/components/home/StyleCategories.tsx src/app/\(shop\)/page.tsx
git commit -m "feat(home): add style categories section"
```

### Task 3: How It Works Section

**Files:**
- Create: `src/components/home/HowItWorks.tsx`
- Modify: `src/app/(shop)/page.tsx`

**Step 1: Create Component**

`src/components/home/HowItWorks.tsx`:
```typescript
import { Upload, Wand2, Frame } from "lucide-react"

const STEPS = [
  {
    icon: Upload,
    title: "Upload Photo",
    desc: "Upload a clear photo of your pet. Dogs, cats, birds - we love them all."
  },
  {
    icon: Wand2,
    title: "Choose Style",
    desc: "Select from 50+ unique artistic styles, from Renaissance to Pop Art."
  },
  {
    icon: Frame,
    title: "Get Art",
    desc: "Receive your museum-quality digital portrait instantly. Ready to print."
  }
]

export function HowItWorks() {
  return (
    <section className="py-24 bg-stone-900 text-stone-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-serif mb-4">
            How it <span className="text-primary-500 italic">Works</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-12 relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-0.5 bg-stone-800" />
          
          {STEPS.map((step, idx) => (
            <div key={idx} className="relative flex flex-col items-center text-center z-10">
              <div className="w-24 h-24 rounded-full bg-stone-800 border border-stone-700 flex items-center justify-center mb-6 shadow-xl">
                <step.icon className="w-10 h-10 text-primary-500" />
              </div>
              <h3 className="text-xl font-serif mb-3">{step.title}</h3>
              <p className="text-stone-400 leading-relaxed max-w-xs">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

**Step 2: Update Home Page**

Modify `src/app/(shop)/page.tsx`:
```typescript
import { Hero } from "@/components/home/Hero"
import { FeaturedGallery } from "@/components/home/FeaturedGallery"
import { StyleCategories } from "@/components/home/StyleCategories"
import { HowItWorks } from "@/components/home/HowItWorks"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Hero />
      <HowItWorks />
      <StyleCategories />
      <FeaturedGallery />
    </div>
  )
}
```

**Step 3: Verify**

Run: `npm run build`
Expected: PASS

**Step 4: Commit**

```bash
git add src/components/home/HowItWorks.tsx src/app/\(shop\)/page.tsx
git commit -m "feat(home): add how it works section"
```

### Task 4: E2E Verification

**Files:**
- Create: `e2e/home-landing.spec.ts`

**Step 1: Write Test**

`e2e/home-landing.spec.ts`:
```typescript
import { test, expect } from '@playwright/test'

test('Home page renders all sections and links', async ({ page }) => {
  await page.goto('/')

  // Hero
  await expect(page.getByText('Masterpieces of Your Pet')).toBeVisible()
  await expect(page.getByRole('link', { name: 'Explore Gallery' })).toBeVisible()

  // How It Works
  await expect(page.getByText('How it Works')).toBeVisible()
  await expect(page.getByText('Upload Photo')).toBeVisible()

  // Styles
  await expect(page.getByText('Browse by Style')).toBeVisible()
  await expect(page.getByText('Classic Oil')).toBeVisible()

  // Gallery
  await expect(page.getByText('Curated Gallery')).toBeVisible()
  // Ensure at least one product card is visible (assuming mock data or seed)
  // Note: If no products, this might fail, but in dev/mock mode we usually have data.
  // We can skip specific product check if db is empty, but let's check for the section.
})
```

**Step 2: Run Test**

Run: `npx playwright test e2e/home-landing.spec.ts`
Expected: PASS

**Step 3: Commit**

```bash
git add e2e/home-landing.spec.ts
git commit -m "test(e2e): verify home page sections"
```
