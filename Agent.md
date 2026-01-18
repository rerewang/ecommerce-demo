# Agent Instructions for Ecommerce Demo

## Agent
- Agent应该与用户通过中文沟通

## 入口文件（工作锚点）

沟通时使用入口文件作为起点，需要细节时再加载对应文件：

| 入口文件 | 用途 |
|---------|------|
| `Health.md` | 作息、运动、饮食 |
| `Career.md` | 接活、求职、技术方向 |
| `Tools.md` | 工具链：信息获取、开发工具、写作流程 |
| `Mind.md` | 心理、情绪、习惯 |
| `Finance.md` | 预算、收入、存款 |

**工作流程：** 先说「看 Health.md」确定状态，再展开细节。

> **CRITICAL**: This project follows strict Test-Driven Development (TDD).
> **RULE**: You must NOT write implementation code without first writing a failing test.

## 1. Core Philosophy: TDD + Systematic Debugging + Verification

### Strict TDD (Test-Driven Development)
**Iron Law:** NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST

**RED-GREEN-REFACTOR Cycle:**
1. **RED** - Write failing test
   - Write one minimal test showing expected behavior
   - Run test to verify it fails with expected error message
   - If test passes immediately → test is wrong, rewrite test
   
2. **GREEN** - Minimal implementation
   - Write simplest code to make test pass
   - No extra features, no "improvements"
   - Run test to verify it passes
   
3. **REFACTOR** - Clean up
   - Remove duplication, improve names
   - Keep tests green
   - Don't add new behavior

**Bugfix Rule:** 
- Write a test that reproduces the bug (watch it fail)
- Fix the bug (watch test pass)
- Never fix bugs without a test

### Systematic Debugging Checklist
When encountering any bug or test failure, BEFORE attempting fixes:

- [ ] **Read error messages completely** (don't skip stack traces)
- [ ] **Reproduce consistently** (100% reproducible before continuing)
- [ ] **Check recent changes** (`git diff`, `git log`)
- [ ] **Multi-component systems**: Add diagnostic logging at EACH component boundary
- [ ] **Trace data flow**: Where does bad value originate? Trace backward to source
- [ ] **Form single hypothesis**: "I think X is root cause because Y"
- [ ] **Test minimally**: Change ONE variable at a time
- [ ] **Verify before continuing**: Did it work? If not, form NEW hypothesis

**3-Strike Rule:** If 3 fix attempts fail → STOP and question the architecture (not just the symptom)

### Verification Before Completion
**Iron Law:** NO COMPLETION CLAIMS WITHOUT FRESH VERIFICATION EVIDENCE

Before claiming "done", "fixed", "passing", or creating commits/PRs:

```bash
# 1. Lint check
npm run lint
# Expected: ✓ No ESLint warnings or errors

# 2. Type check
npx tsc --noEmit
# Expected: No errors

# 3. Unit tests
npm run test
# Expected: All tests pass (N/N)

# 4. E2E tests (MCP Playwright)
npx playwright test
# Expected: N passed (Xs)

# 5. Build verification
npm run build
# Expected: ✓ Compiled successfully
```

**Red Flags (STOP before claiming completion):**
- Using "should", "probably", "seems to"
- Expressing satisfaction before verification ("Great!", "Done!")
- Trusting partial verification (Lint passed ≠ Build will pass)
- Relying on previous test runs (must be FRESH)

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
