# Pre-commit Hook Setup

> ✅ **Update (2026-01-18)**: Husky git hooks are now installed and configured by default! This document is kept for reference.

## Overview

This project uses **Husky** to automatically run quality checks before commits and pushes:

- **Pre-commit**: Runs linting and type checking (fast feedback in ~5-10 seconds)
- **Pre-push**: Runs tests and builds (thorough verification in ~30-60 seconds)

These hooks are part of our three-layer protection strategy. See [`docs/workflows/git-submission-process.md`](./docs/workflows/git-submission-process.md) for complete workflow documentation.

## Automatic Setup

Hooks are installed automatically when you run:

```bash
npm install
```

The `prepare` script in `package.json` ensures Husky is set up:

```json
{
  "scripts": {
    "prepare": "husky install"
  }
}
```

## Manual Verification

To verify hooks are installed correctly:

```bash
# Check hook files exist
ls -la .husky/
# Should see: pre-commit, pre-push, _/husky.sh

# Check hook permissions
ls -l .husky/pre-commit .husky/pre-push
# Should show execute permissions (rwxr-xr-x)

# Test pre-commit hook (without actually committing)
.husky/pre-commit

# Test pre-push hook (without actually pushing)  
.husky/pre-push
```

## What Gets Checked

### Pre-commit Hook (~5-10 seconds)

```bash
npm run lint          # ESLint checks
npx tsc --noEmit     # TypeScript type checking
```

**Catches**: Syntax errors, linting violations, type errors

### Pre-push Hook (~30-60 seconds)

```bash
npm run test         # Unit & integration tests
npm run build        # Production build verification
```

**Catches**: Test failures, build errors, integration issues

## Manual Reinstallation

If hooks aren't working:

```bash
# Reinstall Husky
npx husky install

# Verify installation
ls -la .husky/

# If hooks still don't run, check permissions
chmod +x .husky/pre-commit
chmod +x .husky/pre-push
```

## Bypassing Hooks (Emergency Only)

⚠️ **WARNING**: Only use in genuine emergencies. You MUST fix issues immediately after.

```bash
# Skip pre-commit
git commit --no-verify -m "emergency: critical hotfix"

# Skip pre-push
git push --no-verify
```

**After bypassing**:
1. Create immediate follow-up PR to fix issues
2. Document why bypass was necessary
3. Ensure CI passes

## Troubleshooting

### Hooks Not Running

**Problem**: Commits go through without checks

**Solution**:
```bash
# Reinstall hooks
npx husky install

# Verify git hooks path
git config core.hooksPath
# Should output: .husky
```

### Permission Denied

**Problem**: `.husky/pre-commit: Permission denied`

**Solution**:
```bash
chmod +x .husky/pre-commit
chmod +x .husky/pre-push
```

### Hooks Fail on Fresh Clone

**Problem**: Hooks fail immediately after `git clone`

**Solution**:
```bash
# Install dependencies (triggers Husky setup)
npm install

# Verify hooks installed
ls -la .husky/
```

### False Positives in CI

**Problem**: Hooks pass locally but CI fails

**Solution**:
```bash
# Ensure same Node version as CI
node -v  # Check .github/workflows/deploy.yml

# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Run full verification manually
npm run lint && npx tsc --noEmit && npm run test && npm run build
```

## Hook Configuration Files

### Pre-commit (.husky/pre-commit)

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "🔍 Running pre-commit checks..."
echo "→ Linting code..."
npm run lint || exit 1

echo "→ Checking types..."
npx tsc --noEmit || exit 1

echo "✅ Pre-commit checks passed!"
```

### Pre-push (.husky/pre-push)

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "🧪 Running pre-push checks..."
echo "→ Running tests..."
npm run test || exit 1

echo "→ Building project..."
npm run build || exit 1

echo "✅ Pre-push checks passed!"
```

## CI/CD Integration

Hooks complement our GitHub Actions CI/CD pipeline:

| Stage | What Runs | Duration | Trigger |
|-------|-----------|----------|---------|
| Pre-commit (local) | lint + typecheck | ~5-10s | `git commit` |
| Pre-push (local) | test + build | ~30-60s | `git push` |
| CI/CD (GitHub) | Full suite + E2E + deploy | ~5-10min | Push to main, PRs |

See `.github/workflows/deploy.yml` for CI/CD configuration.

## Best Practices

1. **Don't bypass hooks** unless absolutely necessary
2. **Fix issues immediately** if you had to bypass
3. **Run tests in watch mode** during development (`npm run test -- --watch`)
4. **Commit frequently** with small, focused changes
5. **Use meaningful commit messages** (follow conventional commits)

## Additional Resources

- **Git Workflow Guide**: [`docs/workflows/git-submission-process.md`](./docs/workflows/git-submission-process.md)
- **Agent Guidelines**: [`Agent.md`](./Agent.md)
- **PR Template**: [`.github/pull_request_template.md`](.github/pull_request_template.md)
- **CI/CD Pipeline**: [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)

---

**Questions?** Consult the Git workflow documentation or open an issue.
