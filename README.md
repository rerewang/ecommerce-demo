# E-commerce Demo

A full-stack e-commerce platform built with Next.js, TypeScript, and Supabase.

## Features

- 🛍️ Product catalog with search and filtering
- 🛒 Shopping cart with real-time updates
- 👤 User authentication (sign up, login, logout)
- 💳 Checkout process with form validation
- 📦 Order management and history
- 🔒 Role-based access control (RBAC)
- 📱 Responsive design
- ✅ Comprehensive test coverage (Unit, Integration, E2E)

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **State Management**: Zustand
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Testing**: Vitest, React Testing Library, Playwright
- **CI/CD**: GitHub Actions, Vercel
- **Git Hooks**: Husky (pre-commit, pre-push)

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd ecommerce-demo

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials
```

### Environment Variables

Required in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### Development

```bash
# Start development server
npm run dev

# Run tests in watch mode
npm run test -- --watch

# Run E2E tests
npx playwright test

# Run linting
npm run lint

# Type checking
npx tsc --noEmit
```

## 🔄 Development Workflow

This project uses a **three-layer protection strategy** with automated git hooks:

### Layer 1: Pre-commit (Fast - ~5-10s)
Runs automatically on `git commit`:
- ESLint (linting)
- TypeScript type checking

### Layer 2: Pre-push (Thorough - ~30-60s)
Runs automatically on `git push`:
- Unit & Integration tests
- Production build verification

### Layer 3: CI/CD (Complete - ~5-10min)
Runs on GitHub for PRs and pushes to main:
- Full test suite + E2E tests
- Production build + deployment

### Standard Workflow

```bash
# 1. Create feature branch
git checkout -b feat/your-feature

# 2. TDD: Write test → Fail → Implement → Pass
npm run test -- --watch

# 3. Commit (hooks run automatically)
git commit -m "feat: add feature"

# 4. Push (hooks verify tests + build)
git push -u origin feat/your-feature

# 5. Create PR (CI runs full verification)
```

**📚 Detailed Guide**: See [`docs/workflows/git-submission-process.md`](./docs/workflows/git-submission-process.md) for complete workflow documentation.

## Testing

### Unit & Integration Tests

```bash
# Run all tests
npm run test

# Run with coverage
npm run test -- --coverage

# Run specific test file
npm run test src/components/cart/CartView.test.tsx

# Watch mode (for TDD)
npm run test -- --watch
```

### E2E Tests

```bash
# Run all E2E tests
npx playwright test

# Run with UI mode
npx playwright test --ui

# Run specific test
npx playwright test checkout.spec.ts

# Debug mode
npx playwright test --debug
```

### Test Coverage

Current coverage (as of 2026-01-18):
- **Total Tests**: 35 unit/integration + 8 E2E
- **Coverage**: Components, stores, services, and critical user flows
- **TDD Compliant**: All features developed test-first

## Verification Before Deployment

Before merging to main, ensure all checks pass:

```bash
npm run lint           # ✓ No errors
npx tsc --noEmit      # ✓ No errors  
npm run test          # ✓ All pass
npx playwright test   # ✓ All pass
npm run build         # ✓ Successful
```

These checks run automatically via:
1. **Git hooks** (pre-commit, pre-push)
2. **GitHub Actions** (CI/CD pipeline)
3. **PR template checklist**

## Project Structure

```
ecommerce-demo/
├── .github/
│   ├── workflows/
│   │   └── deploy.yml              # CI/CD pipeline
│   └── pull_request_template.md    # PR checklist
├── .husky/                          # Git hooks
│   ├── pre-commit                   # Lint + typecheck
│   └── pre-push                     # Tests + build
├── e2e/                             # Playwright E2E tests
│   ├── auth.spec.ts
│   ├── cart.spec.ts
│   ├── checkout.spec.ts
│   └── ...
├── public/                          # Static assets
├── src/
│   ├── app/                         # Next.js app router
│   ├── components/                  # React components + tests
│   ├── lib/                         # Utilities
│   ├── services/                    # API services + tests
│   ├── store/                       # Zustand stores + tests
│   └── types/                       # TypeScript types
├── docs/
│   ├── workflows/
│   │   └── git-submission-process.md  # Development workflow guide
│   ├── plans/                       # Feature planning
│   └── retrospective/               # Session summaries
├── Agent.md                         # Project-specific AI agent rules
└── README.md                        # This file
```

## Deployment

This project is configured for automatic deployment to Vercel:

- **Production**: Deploys automatically on push to `main`
- **Preview**: Deploys automatically on PR creation
- **CI/CD**: GitHub Actions runs full verification before deploy

### Manual Deployment

```bash
# Build production bundle
npm run build

# Start production server locally
npm start
```

## Database Schema

Managed via Supabase:

- **users** - User profiles (extends Supabase auth)
- **products** - Product catalog
- **orders** - Order records
- **order_items** - Order line items

Row-level security (RLS) policies enforce access control.

## Role-Based Access Control (RBAC)

- **Guest**: Browse products, view cart (local state)
- **Customer**: All guest permissions + place orders, view order history
- **Admin**: All customer permissions + manage products, view all orders

Roles stored in `users.role` column.

## Known Limitations

1. **RLS Order Updates**: Due to Supabase RLS policies, order status updates from client-side may result in 'pending' status. This is expected behavior and documented in E2E tests.

2. **Parallel E2E Tests**: Running all E2E tests in parallel may occasionally cause login timeouts. Tests pass consistently when run sequentially (handled in CI via `workers: 1`).

## Contributing

1. Read [`docs/workflows/git-submission-process.md`](./docs/workflows/git-submission-process.md)
2. Follow TDD practices (test-first development)
3. Use conventional commit messages
4. Ensure all verification checks pass
5. Fill out PR template checklist

## Documentation

- **Agent Guidelines**: [`Agent.md`](./Agent.md) - Project-specific AI agent rules
- **Master Guidelines**: [`../AGENTS.md`](../AGENTS.md) - Organization-wide agent guidelines
- **Git Workflow**: [`docs/workflows/git-submission-process.md`](./docs/workflows/git-submission-process.md)
- **Session Summaries**: [`docs/retrospective/`](./docs/retrospective/)

## License

MIT

## Support

For questions or issues:
1. Check existing documentation
2. Review [`AGENTS.md`](../AGENTS.md) for development guidelines
3. Open an issue with detailed description

---

**Built with ❤️ using TDD practices and modern web technologies**
