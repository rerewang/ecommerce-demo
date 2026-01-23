# PetPixel Gallery - UI/UX Overhaul & Home Page Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform the e-commerce demo into "PetPixel Gallery" – a premium, art-gallery style digital goods store for AI pet portraits, featuring a new landing page and "Liquid Glass" design system.

### 3. Visual System (Blue/Slate Implementation)

*Note: The original design plan proposed a "Liquid Glass" (Gold/Stone) theme. However, during implementation, a "Modern Clean" (Blue/Slate) theme was adopted as the production standard for V1. This document reflects the actual implemented system.*

**Color Palette (Implemented)**:
- **Primary**: Blue-600 (`#2563EB`) - Trust, Clarity
- **Secondary**: Slate-900 (`#0F172A`) - Premium Text
- **Background**: Slate-50 (`#F8FAFC`) - Clean Surface
- **Accent**: Sky-500 (`#0EA5E9`) - Highlights

**Typography**:
- **Headings**: Rubik / Inter (Clean, Modern)
- **Body**: Nunito Sans (Readable)

**UI Elements**:
- **Cards**: White bg, soft shadow-sm, rounded-xl
- **Buttons**: Blue-600 bg, white text, pill-shaped or rounded-lg
- **Animations**: Subtle fade-in, hover-lift (transform-y-1)

---

*(Archived) Original Concept - Liquid Glass*:
- *Primary: #D4AF37 (Metallic Gold)*
- *Secondary: #1C1917 (Stone-900)*
- *Font: Playfair Display*


**Step 2: Verify UI Test**

Run: `npm run test src/components/ui/Button.test.tsx` (existing test should still pass, maybe update snapshot if used)
Expected: PASS

**Step 3: Commit**

```bash
git add src/components/ui/Button.tsx
git commit -m "feat(ui): update button styles to liquid glass theme"
```

### Task 3: Migrate Product List to /products

**Files:**
- Move: `src/app/(shop)/page.tsx` -> `src/app/(shop)/products/page.tsx`
- Create: `src/app/(shop)/products/layout.tsx` (Optional, if needed specific layout)

**Step 1: Move File**

```bash
mkdir -p src/app/\(shop\)/products
mv src/app/\(shop\)/page.tsx src/app/\(shop\)/products/page.tsx
```

**Step 2: Verify Routes**

Run: `npm run build`
Expected: PASS (Next.js handles file moves if imports are relative or alias based)

**Step 3: Commit**

```bash
git add src/app
git commit -m "refactor: move product list to /products route"
```

### Task 4: Create New Landing Page (Home)

**Files:**
- Create: `src/app/(shop)/page.tsx`
- Create: `src/components/home/Hero.tsx`
- Create: `src/components/home/FeaturedGallery.tsx`

**Step 1: Create Hero Component**

`src/components/home/Hero.tsx`:
```typescript
import { Button } from "@/components/ui/Button"
import Link from "next/link"

export function Hero() {
  return (
    <section className="relative pt-20 pb-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-5xl md:text-7xl font-serif text-stone-900 mb-6 text-balance">
          Masterpieces of <span className="text-primary italic">Your Pet</span>
        </h1>
        <p className="text-xl text-stone-600 mb-10 max-w-2xl mx-auto text-balance">
          Transform your furry friend into timeless digital art. 
          Museum-quality AI portraits, generated instantly.
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/products">
            <Button size="lg" className="rounded-full px-8 text-lg">
              Explore Gallery
            </Button>
          </Link>
        </div>
      </div>
      {/* Decorative background blur blobs here */}
    </section>
  )
}
```

**Step 2: Create Landing Page**

`src/app/(shop)/page.tsx`:
```typescript
import { Hero } from "@/components/home/Hero"
// import { FeaturedGallery } from "@/components/home/FeaturedGallery"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Hero />
      {/* <FeaturedGallery /> */}
    </div>
  )
}
```

**Step 3: Verify Build**

Run: `npm run build`
Expected: PASS

**Step 4: Commit**

```bash
git add src/app/\(shop\)/page.tsx src/components/home/Hero.tsx
git commit -m "feat(home): add new landing page with hero section"
```

### Task 5: Refine Navigation & Layout

**Files:**
- Modify: `src/components/layout/Header.tsx` (or wherever Header is)

**Step 1: Update Header Style**

- Make it sticky + glassmorphism (`bg-white/80 backdrop-blur-md`).
- Update Logo font to `font-serif`.
- Update Links: "Gallery" -> `/products`.

**Step 2: Commit**

```bash
git add src/components/layout/Header.tsx
git commit -m "feat(ui): apply glass style to header navigation"
```
