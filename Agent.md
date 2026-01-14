# Agent Instructions for Ecommerce Demo

## Agent
- Agent应该与用户通过中文沟通

> **CRITICAL**: This project follows strict Test-Driven Development (TDD).
> **RULE**: You must NOT write implementation code without first writing a failing test.

## 1. Core Philosophy: TDD & E2E
Every feature or bugfix must follow this cycle:
1.  **Unit/Integration (Vitest)**: Write failing test -> Implement -> Pass.
2.  **Build Verification**: Run `npm run build` to catch Server/Client boundary errors (Lint/Unit tests often miss these).
3.  **E2E (Playwright)**: For critical flows (Checkout, Login, Admin), write a Playwright test.
4.  **Self-Correction**: Use the MCP Playwright tool to run these tests.

**If you are asked to "fix a bug":**
- Reproduce it with a test case first.

## 2. Tech Stack & Standards
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (Strict mode)
- **Styling**: Tailwind CSS (Soft UI Evolution style)
- **State**: Zustand (with persistence for cart)
- **Backend**: Supabase (PostgreSQL + RLS + Auth)
- **Testing**: 
  - Unit: Vitest + React Testing Library
  - E2E: Playwright (Managed via MCP)

## 3. Security & Auth
- **User Auth**: Supabase Auth (Email/Password)
- **Role Base**: Admin vs Customer
- **Protection**:
  - Middleware protection for `/admin` routes.
  - RLS (Row Level Security) on ALL database tables.
  - UI elements hidden based on role.

## 4. Directory Structure
- `src/app`: Page routes (Server Components by default)
- `src/components`: UI components (Client Components only when interactivity needed)
  - `src/components/ui`: Base design system components (Button, Card, Input)
  - `src/components/products`: Product-specific components
- `src/lib`: Utilities and Supabase client
- `src/services`: Data fetching logic (keep separate from UI)
- `src/store`: Zustand stores
- `src/types`: TypeScript interfaces

## 4. UI/UX Guidelines
- **Style**: Soft UI Evolution (Subtle shadows, rounded corners, "premium" feel)
- **Interactions**: Hover effects on cards/buttons, smooth transitions (200-300ms)
- **Feedback**: Loading states, success/error toasts (or badges)
- **Accessibility**: Semantic HTML, proper ARIA labels

## 5. Command Reference
- **Run Dev**: `npm run dev`
- **Run Tests**: `npm run test` (Vitest)
- **Build**: `npm run build`

---
**When starting a task, ALWAYS check this file first.**
