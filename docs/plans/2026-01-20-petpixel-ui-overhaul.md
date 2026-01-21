# PetPixel Gallery - UI/UX Overhaul & Home Page Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform the e-commerce demo into "PetPixel Gallery" – a premium, art-gallery style digital goods store for AI pet portraits, featuring a new landing page and "Liquid Glass" design system.

**Architecture:**
- **Design System**: Implement "Liquid Glass" style (neutrals, glassmorphism, Playfair Display/Inter) via Tailwind configuration and global CSS.
- **Routing**: Split `page.tsx` (current list) into `(shop)/page.tsx` (new Landing) and `(shop)/products/page.tsx` (Product List).
- **Components**: Refactor core UI components (Button, Card, Layout) to match the new premium aesthetic.

**Tech Stack:** Next.js App Router, Tailwind CSS, Lucide React (Icons), Google Fonts (Playfair Display, Inter).

### Task 1: Establish Global Design System

**Files:**
- Modify: `src/app/layout.tsx` (Add fonts)
- Modify: `src/app/globals.css` (Base styles, colors)
- Modify: `tailwind.config.ts` (Theme extension)

**Step 1: Update Tailwind Config**

Extend theme with new "PetPixel" palette and fonts.

`tailwind.config.ts`:
```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#FAFAF9", // Stone-50
        foreground: "#0C0A09", // Stone-950
        primary: {
          DEFAULT: "#CA8A04", // Yellow-600 (Gold/Bronze)
          foreground: "#FFFFFF",
          50: "#FEFCE8",
          100: "#FEF9C3",
          500: "#EAB308",
          600: "#CA8A04", // Primary
          700: "#A16207",
        },
        secondary: {
          DEFAULT: "#44403C", // Stone-700
          foreground: "#FAFAF9",
        },
        muted: {
          DEFAULT: "#F5F5F4", // Stone-100
          foreground: "#78716C", // Stone-500
        },
        card: {
          DEFAULT: "rgba(255, 255, 255, 0.7)", // Glass
          foreground: "#0C0A09",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        serif: ["var(--font-playfair)", "serif"],
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
};
export default config;
```

**Step 2: Update Fonts in Layout**

Modify `src/app/layout.tsx` to load Inter and Playfair Display.

```typescript
import { Inter, Playfair_Display } from "next/font/google";
// ... imports

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

// ... inside RootLayout
<body className={`${inter.variable} ${playfair.variable} font-sans antialiased bg-background text-foreground`}>
```

**Step 3: Update Global Styles**

`src/app/globals.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-stone-50 text-stone-950;
  }
  h1, h2, h3, h4, h5, h6 {
    @apply font-serif font-medium tracking-tight;
  }
}

@layer utilities {
  .glass-panel {
    @apply bg-white/70 backdrop-blur-md border border-white/50 shadow-sm;
  }
  .text-balance {
    text-wrap: balance;
  }
}
```

**Step 4: Verify Build**

Run: `npm run build`
Expected: PASS

**Step 5: Commit**

```bash
git add src/app/layout.tsx src/app/globals.css tailwind.config.ts
git commit -m "feat(ui): implement PetPixel design system (fonts, colors, glass)"
```

### Task 2: Refactor UI Components (Glass Style)

**Files:**
- Modify: `src/components/ui/Button.tsx`
- Modify: `src/components/ui/Card.tsx` (if exists, or create wrapper)

**Step 1: Update Button Component**

Apply premium styling (rounded-full, transition, gold).

`src/components/ui/Button.tsx`:
```typescript
// ... imports
// Update variants in cva or logic
/*
  primary: "bg-primary text-white hover:bg-primary/90 shadow-sm hover:shadow-md transition-all duration-300",
  secondary: "bg-white/80 text-secondary hover:bg-white border border-stone-200 shadow-sm backdrop-blur-sm",
  ghost: "hover:bg-stone-100 text-stone-600 hover:text-stone-900",
  outline: "border-2 border-primary text-primary hover:bg-primary/5",
*/
// Ensure rounded-full or rounded-xl for softer look
```

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
