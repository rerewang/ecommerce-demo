# Product Detail Page (PDP) Optimization Strategy

## Current Status
- **Implemented:**
  - Dynamic Variants & Metadata (JSONB)
  - "Buy Now" flow with Zustand
  - Basic Skeleton Loading
  - SSG (`generateStaticParams`)
  - Basic Metadata (title/description)

- **Missing / To Do (from old plan):**
  - **SEO:** JSON-LD Structured Data
  - **UX:** "Related Products" section
  - **Reliability:** Error Boundary (`error.tsx`)
  - **Service:** Enhanced `getProductsByCategory` (exclude current, limit)

## Brainstorming Question 1: Scope Definition

We need to finalize the scope for the **Optimization Plan**.

Which of these areas should we focus on? (Select all that apply)

A. **SEO Maximization:** Add rich JSON-LD (Product, Offer, Breadcrumb) and OpenGraph tags.
B. **Conversion & UX:** Add "Related Products" recommendation engine (same category).
C. **Resilience:** Add `error.tsx` to gracefully handle 404s/crashes with a "Retry" or "Back to Shop" UI.
D. **Performance:** Optimize image loading strategies (sizes, priority) or implement granular caching.
E. **Process:** Enforce the "Plan First" rule in `AGENTS.md` (as mentioned in the previous plan).

*My Recommendation:* **A, B, C, and E.**  
A, B, C are direct user-facing improvements missing from the recent overhaul. E ensures we don't regress on process. D might be premature unless we see specific issues.
