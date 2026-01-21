# E-commerce Demo - Agent Guidelines

**Project**: ecommerce-demo  
**Last Updated**: 2026-01-18  
**Parent Guidelines**: [`../AGENTS.md`](../AGENTS.md) (MUST follow all master guidelines)

---

## Project Overview

Full-stack e-commerce platform with:
- Next.js 14 (App Router) + TypeScript
- Supabase (Auth, Database, RLS)
- Zustand (State Management)
- Vitest + Playwright (Testing)
- Tailwind CSS (Styling)
- Husky (Git Hooks)

**Key Features**: Product catalog, shopping cart, checkout, user auth, RBAC, order management

---

## Critical Requirements

### 1. TDD is MANDATORY

Per [`../AGENTS.md`](../AGENTS.md), follow strict Test-Driven Development:

```bash
# REQUIRED WORKFLOW for all features:
1. Write failing test
2. Run test → watch it fail (RED)
3. Implement minimum code
4. Run test → watch it pass (GREEN)  
5. Refactor (if needed)
6. Commit both test + implementation together

# Use watch mode during development
npm run test -- --watch src/components/your-component.test.tsx
```

**Test Coverage Requirements**:
- ✅ Every new component needs `.test.tsx`
- ✅ Every new service/util needs `.test.ts`
- ✅ Every new store needs `.test.ts`
- ✅ Critical user flows need E2E tests in `e2e/`

### 2. Pre-Deployment Verification (5 Commands)

Before claiming "DONE" or merging to main, run ALL 5 verification commands:

```bash
npm run lint           # ✓ No errors (1 warning acceptable)
npx tsc --noEmit      # ✓ No type errors
npm run test          # ✓ All tests pass
npx playwright test   # ✓ All E2E tests pass (no skips)
npm run build         # ✓ Production build succeeds
```

**Status**: 5/5 verified ✅ (required for completion)

### 3. Git Workflow (Three-Layer Protection)

This project uses automated git hooks. See [`docs/workflows/git-submission-process.md`](./docs/workflows/git-submission-process.md) for complete guide.

**Summary**:
- **Layer 1 (Pre-commit)**: Auto-runs lint + typecheck on `git commit`
- **Layer 2 (Pre-push)**: Auto-runs tests + build on `git push`
- **Layer 3 (CI/CD)**: GitHub Actions runs full suite on PR/push to main

**Standard Workflow**:
```bash
git checkout -b feat/your-feature
# TDD: Write test → Implement → Pass
git commit -m "feat: add feature"  # Hooks verify automatically
git push -u origin feat/your-feature  # Hooks verify automatically
# Create PR → CI verifies → Merge
```

---

## Project-Specific Rules

### Testing Standards

#### Unit & Integration Tests (Vitest + React Testing Library)

**Location**: Co-located with source files (e.g., `Button.tsx` → `Button.test.tsx`)

**Required Patterns**:
```typescript
// Component tests
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'

describe('ComponentName', () => {
  it('renders correctly', () => {
    render(<ComponentName />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })
  
  it('handles user interactions', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()
    render(<Button onClick={handleClick} />)
    await user.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

**Test Coverage** (as of 2026-01-18):
- Total: 35 unit/integration tests
- Components: `CartView`, `CheckoutForm`, `CartItem`, etc.
- Services: `orders.test.ts` (14 tests)
- Stores: `cart.test.ts` (19 tests)

#### E2E Tests (Playwright)

**Location**: `e2e/` directory

**Required for**:
- User authentication flows (`auth.spec.ts`)
- Shopping cart operations (`cart.spec.ts`)
- Checkout process (`checkout.spec.ts`)
- RBAC enforcement (`rbac.spec.ts`)
- Product browsing (`products.spec.ts`)

**Example Pattern**:
```typescript
import { test, expect } from '@playwright/test'

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup
  })
  
  test('user can complete flow', async ({ page }) => {
    // Arrange
    await page.goto('/')
    
    // Act
    await page.getByRole('button', { name: 'Add to Cart' }).click()
    
    // Assert
    await expect(page.getByText('Item added')).toBeVisible()
  })
})
```

**Current E2E Coverage**: 8 tests (all passing, no skips)

### Supabase Patterns

#### Client Initialization

```typescript
import { createClient } from '@/lib/supabase/client'

// In components (client-side)
const supabase = createClient()

// In server components
import { createServerClient } from '@/lib/supabase/server'
const supabase = createServerClient()
```

#### RLS Awareness

**IMPORTANT**: Some operations are restricted by Row-Level Security:

1. **Order Status Updates**: Client-side updates may fail due to RLS policies
   - Expected behavior: Orders may remain in 'pending' status
   - Documented in: `e2e/checkout.spec.ts` comments
   - Workaround: Accept 'pending' status in tests

2. **Admin Operations**: Require proper role in `users.role`
   - Test admin access in `e2e/rbac.spec.ts`

#### Type Safety

```typescript
// Always use typed queries
import { Database } from '@/types/supabase'

const { data, error } = await supabase
  .from('products')
  .select('*')
  .returns<Database['public']['Tables']['products']['Row'][]>()
```

### State Management (Zustand)

**Cart Store** (`src/store/cart.ts`):
- Tested in `cart.test.ts` (19 tests)
- Handles: Add, remove, update quantity, clear cart
- Persisted to localStorage
- Type-safe with TypeScript

**Testing Zustand Stores**:
```typescript
import { renderHook, act } from '@testing-library/react'
import { useCartStore } from './cart'

it('adds items to cart', () => {
  const { result } = renderHook(() => useCartStore())
  
  act(() => {
    result.current.addItem(mockProduct, 2)
  })
  
  expect(result.current.items).toHaveLength(1)
  expect(result.current.items[0].quantity).toBe(2)
})
```

### Component Patterns

#### Server Components (Default)

```typescript
// app/products/page.tsx
import { createServerClient } from '@/lib/supabase/server'

export default async function ProductsPage() {
  const supabase = createServerClient()
  const { data: products } = await supabase.from('products').select('*')
  
  return <ProductList products={products} />
}
```

#### Client Components (When Needed)

```typescript
'use client'

import { useState } from 'react'
import { useCartStore } from '@/store/cart'

export function AddToCartButton({ product }: Props) {
  const addItem = useCartStore((state) => state.addItem)
  // ...
}
```

**Rule**: Only use `'use client'` when necessary (hooks, event handlers, browser APIs)

---

## Debugging Workflow

Per [`../AGENTS.md`](../AGENTS.md) debugging protocol:

### 1. Test Failures

```bash
# Run failing test in isolation
npm run test src/path/to/failing.test.tsx

# Use vitest UI for debugging
npm run test -- --ui

# Check test coverage
npm run test -- --coverage
```

### 2. E2E Failures

```bash
# Run in UI mode
npx playwright test --ui

# Run specific test
npx playwright test checkout.spec.ts

# Debug mode (opens browser)
npx playwright test --debug

# Check for race conditions
npx playwright test --workers=1
```

### 3. Build Failures

```bash
# Type checking
npx tsc --noEmit

# Check specific error
npx tsc --noEmit | grep "error TS"

# Incremental build
npm run build
```

### 4. Supabase Issues

```bash
# Check RLS policies in Supabase dashboard
# Table Editor → Select table → RLS tab

# Test auth flow
# Auth → Users → Check user roles

# Verify database schema
# Database → Tables → Check columns/types
```

---

## Known Issues & Workarounds

### 1. E2E Parallel Test Flakiness

**Issue**: Login occasionally times out when running all E2E tests in parallel

**Workaround**: 
```bash
# CI runs sequentially (playwright.config.ts: workers: 1)
# Locally, rerun flaky test:
npx playwright test auth.spec.ts
```

### 2. RLS Order Status Updates

**Issue**: Client-side order status updates blocked by RLS

**Expected Behavior**: Orders remain in 'pending' status

**Test Handling**:
```typescript
// e2e/checkout.spec.ts
await expect(page.getByText(/pending|processing/i)).toBeVisible()
// Accept either status due to RLS limitation
```

**Documentation**: See test comments in `e2e/checkout.spec.ts`

### 3. Linting Warning

**Issue**: 1 ESLint warning about `any` type (acceptable)

**Command Output**:
```bash
npm run lint
# ⚠️ 1 warning (does not block verification)
```

**Status**: Acceptable per project standards

---

## File Structure Reference

```
ecommerce-demo/
├── .github/
│   ├── workflows/deploy.yml         # CI/CD
│   └── pull_request_template.md     # PR checklist
├── .husky/                           # Git hooks
│   ├── pre-commit                    # Lint + typecheck
│   └── pre-push                      # Tests + build
├── e2e/                              # Playwright E2E tests (8 tests)
│   ├── auth.spec.ts
│   ├── cart.spec.ts
│   ├── checkout.spec.ts             # Fixed (was skipped)
│   ├── products.spec.ts
│   ├── rbac.spec.ts                 # Fixed (was skipped)
│   └── ...
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/
│   │   ├── (shop)/
│   │   ├── admin/
│   │   └── api/
│   ├── components/                   # React components + tests
│   │   ├── cart/
│   │   │   ├── CartView.tsx
│   │   │   ├── CartView.test.tsx    # 7 tests
│   │   │   └── CartItem.test.tsx
│   │   └── checkout/
│   │       ├── CheckoutForm.tsx
│   │       └── CheckoutForm.test.tsx # 5 tests
│   ├── lib/                          # Utilities
│   │   ├── supabase/
│   │   └── utils/
│   ├── services/                     # API services
│   │   ├── orders.ts
│   │   └── orders.test.ts           # 14 tests
│   ├── store/                        # Zustand stores
│   │   ├── cart.ts
│   │   └── cart.test.ts             # 19 tests
│   └── types/
│       └── supabase.ts              # Generated types
├── docs/
│   ├── workflows/
│   │   └── git-submission-process.md  # IMPORTANT: Git workflow guide
│   ├── plans/
│   └── retrospective/
│       ├── 05_workflow_optimization_recommendations.md
│       └── 06_tdd_remediation_session_2026-01-18.md
├── Agent.md                          # This file
├── README.md                         # Project documentation
├── PRE_COMMIT_SETUP.md              # Husky setup guide
└── package.json
```

---

## Quick Command Reference

### Development
```bash
npm run dev              # Start dev server (localhost:3000)
npm run test -- --watch  # TDD watch mode
npx playwright test --ui # E2E test UI
```

### Verification (PRE-DEPLOYMENT REQUIRED)
```bash
npm run lint            # ESLint
npx tsc --noEmit       # TypeScript
npm run test           # Unit + Integration
npx playwright test    # E2E
npm run build          # Production build
```

### Git Workflow (Automated via Husky)
```bash
git commit -m "feat: ..."  # Auto: lint + typecheck
git push                   # Auto: test + build
# Then: Create PR → CI runs full suite
```

### Database
```bash
# Regenerate Supabase types
npx supabase gen types typescript --project-id <id> > src/types/supabase.ts
```

---

## Session Documentation

All agent sessions should be documented in `docs/retrospective/` with:
- Date and session ID
- What was done
- What was learned
- Verification status (5/5 commands)
- Next steps

**Latest**: [`06_tdd_remediation_session_2026-01-18.md`](./docs/retrospective/06_tdd_remediation_session_2026-01-18.md)

---

## External Resources

- **Master Agent Guidelines**: [`../AGENTS.md`](../AGENTS.md) - Organization-wide rules
- **Git Workflow**: [`docs/workflows/git-submission-process.md`](./docs/workflows/git-submission-process.md)
- **Supabase Docs**: https://supabase.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Playwright Docs**: https://playwright.dev
- **Vitest Docs**: https://vitest.dev

---

**When in doubt**: Follow TDD, verify with 5 commands, consult `AGENTS.md`, document your work.

---

## 🔒 Secrets & Notifications

Sensitive credentials and webhook URLs are stored in the `.secrets` file (gitignored).

**Agent Requirements**:
1. **Read-Only**: Use `.secrets` to read configuration (Supabase URL/Key, Discord Webhook).
2. **Notification**: Use the Discord Webhook for critical alerts:
   - CI/CD Failures
   - Blocking Issues
   - Decisions Required
   - Completion Reports

**Do NOT commit `.secrets` to git.**
