# Git Submission Process

**Last Updated**: 2026-01-18  
**Project**: ecommerce-demo  
**Purpose**: Standardized Git workflow with three-layer protection

---

## 🛡️ Three-Layer Protection Strategy

This project implements a three-layer verification strategy to catch issues early and maintain code quality:

```
┌─────────────────────────────────────────────────────────────┐
│ Layer 1: Pre-commit (Local - Fast)                          │
│ ⚡ ~5-10 seconds                                             │
│ → npm run lint                                              │
│ → npx tsc --noEmit                                          │
│ Catches: Syntax errors, linting violations, type errors     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Layer 2: Pre-push (Local - Thorough)                        │
│ 🧪 ~30-60 seconds                                            │
│ → npm run test                                              │
│ → npm run build                                             │
│ Catches: Test failures, build errors, integration issues    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Layer 3: CI/CD (GitHub Actions - Complete)                  │
│ 🚀 ~5-10 minutes                                             │
│ → Lint + Typecheck + Tests + E2E + Build + Deploy          │
│ Catches: Environment-specific issues, E2E failures          │
│ Triggers: Push to main, Pull Requests                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 Standard Development Workflow

### 1. Create Feature Branch

```bash
# Start from main
git checkout main
git pull origin main

# Create feature branch (use conventional commit prefixes)
git checkout -b feat/your-feature-name
# or: fix/bug-name, docs/update-readme, chore/cleanup, etc.
```

### 2. TDD Development Cycle

Follow **Test-Driven Development** (per `AGENTS.md`):

```bash
# 1. Write failing test
npm run test -- --watch src/components/your-component.test.tsx

# 2. Watch it fail (RED)
# 3. Implement minimum code to pass
# 4. Watch it pass (GREEN)
# 5. Refactor if needed
# 6. Repeat
```

### 3. Commit Changes (Layer 1 Protection)

```bash
# Stage your changes
git add src/components/your-component.tsx
git add src/components/your-component.test.tsx

# Commit (pre-commit hook runs automatically)
git commit -m "feat: add new component feature

- Implement XYZ functionality
- Add comprehensive tests
- Update documentation"

# ✅ Pre-commit hook runs:
# → npm run lint (ESLint)
# → npx tsc --noEmit (TypeScript)
#
# If hooks fail:
# - Fix the issues
# - Stage the fixes: git add .
# - Try commit again
```

**What happens if pre-commit fails?**
```bash
# Example failure:
❌ Found 3 linting errors
❌ Found 1 type error

# Fix the issues:
npm run lint -- --fix  # Auto-fix linting
# Manually fix type errors

# Stage and commit again:
git add .
git commit -m "feat: add new component feature"
```

### 4. Push to Remote (Layer 2 Protection)

```bash
# Push to origin (pre-push hook runs automatically)
git push -u origin feat/your-feature-name

# ✅ Pre-push hook runs:
# → npm run test (Unit + Integration tests)
# → npm run build (Production build)
#
# If hooks fail:
# - Review test failures
# - Fix the issues
# - Commit fixes
# - Try push again
```

**What happens if pre-push fails?**
```bash
# Example failure:
❌ 3 tests failed
❌ Build failed with type errors

# Fix the issues:
npm run test  # Review failures
# Fix failing tests and/or implementation

# Commit and push again:
git add .
git commit -m "fix: resolve test failures"
git push -u origin feat/your-feature-name
```

### 5. Create Pull Request (Layer 3 Protection)

```bash
# Create PR on GitHub
# Use the PR template which includes:
```

**PR Checklist** (from `.github/pull_request_template.md`):
- [ ] `npm run lint` - No errors
- [ ] `npx tsc --noEmit` - No errors
- [ ] `npm run test` - All tests pass
- [ ] `npx playwright test` - All E2E tests pass
- [ ] `npm run build` - Production build successful
- [ ] New features have tests
- [ ] Documentation updated

**CI/CD Pipeline runs automatically**:
```yaml
# .github/workflows/deploy.yml
1. Checkout code
2. Setup Node.js
3. Install dependencies
4. Run lint
5. Run typecheck
6. Run unit tests
7. Run E2E tests (Playwright)
8. Build production bundle
9. Deploy to Vercel (if main branch)
```

### 6. Merge to Main

```bash
# After PR approval and CI passes:
# - Merge via GitHub UI (squash and merge recommended)
# - Delete feature branch

# Update local main:
git checkout main
git pull origin main
git branch -d feat/your-feature-name
```

---

## 🚨 Bypass Hooks (Emergency Only)

**⚠️ WARNING**: Only use in genuine emergencies. You MUST fix issues immediately after.

```bash
# Skip pre-commit hook
git commit --no-verify -m "emergency: critical hotfix"

# Skip pre-push hook
git push --no-verify

# ⚠️ YOU MUST:
# 1. Create immediate follow-up PR to fix issues
# 2. Document why bypass was necessary
# 3. Ensure CI passes
```

---

## 🔧 Troubleshooting

### Pre-commit Hook Not Running

```bash
# Reinstall hooks
npx husky install

# Verify hook files exist
ls -la .husky/
# Should see: pre-commit, pre-push, _/husky.sh

# Check hook permissions
chmod +x .husky/pre-commit
chmod +x .husky/pre-push
```

### CI Failing But Local Passes

```bash
# Ensure you're running same Node version as CI
node -v  # Should match .github/workflows/deploy.yml

# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Run full verification suite
npm run lint && npx tsc --noEmit && npm run test && npx playwright test && npm run build
```

### E2E Tests Flaky in CI

```bash
# Known issue: Parallel execution can cause login timeouts
# Solution in CI: Tests run sequentially via `workers: 1`

# Locally reproduce:
npx playwright test --workers=1

# If still failing, run specific test:
npx playwright test checkout.spec.ts
```

---

## 📚 Quick Reference

### Essential Commands

```bash
# Local verification (manual - runs automatically via hooks)
npm run lint              # ESLint
npx tsc --noEmit         # TypeScript
npm run test             # Vitest (unit + integration)
npx playwright test      # E2E tests
npm run build            # Production build

# Development
npm run dev              # Start dev server
npm run test -- --watch  # Watch mode for TDD
npx playwright test --ui # E2E test UI mode

# Git hooks (automatic)
# - Pre-commit: Runs on `git commit`
# - Pre-push: Runs on `git push`
```

### Hook Timing Expectations

| Hook | Duration | What Runs | When It Blocks |
|------|----------|-----------|----------------|
| Pre-commit | 5-10s | lint + typecheck | Syntax/type errors |
| Pre-push | 30-60s | test + build | Test failures, build errors |
| CI/CD | 5-10min | Full suite + E2E + deploy | Any verification failure |

### Conventional Commit Prefixes

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `test:` - Adding/updating tests
- `chore:` - Maintenance (deps, config, etc.)
- `refactor:` - Code refactoring
- `perf:` - Performance improvements
- `ci:` - CI/CD changes

---

## 🎯 Success Metrics

A successful workflow means:

1. ✅ **Fast feedback**: Issues caught in <10s (pre-commit)
2. ✅ **High confidence**: Comprehensive verification before push
3. ✅ **Zero broken main**: CI catches anything hooks missed
4. ✅ **TDD compliance**: All features have tests
5. ✅ **Clean history**: Meaningful commit messages

---

## 📖 Related Documentation

- `../AGENTS.md` - Master agent guidelines (TDD, debugging, verification)
- `../../.github/pull_request_template.md` - PR template with checklist
- `../../.github/workflows/deploy.yml` - CI/CD pipeline configuration
- `../retrospective/05_workflow_optimization_recommendations.md` - Optimization rationale
- `../retrospective/06_tdd_remediation_session_2026-01-18.md` - TDD remediation summary

---

**Questions or Issues?** Open an issue or consult `AGENTS.md` for agent-specific workflows.
