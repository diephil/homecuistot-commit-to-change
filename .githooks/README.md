# Git Hooks Setup

## Pre-commit Hook

This repository uses a pre-commit hook to ensure TypeScript type safety.

### What it does

- Runs TypeScript type checking on `src/` directory before each commit
- Prevents commits with TypeScript errors in production code
- Skips test files to allow incremental test refactoring

### Installation

The hook should be automatically present at `.git/hooks/pre-commit` after cloning.

If missing, copy from this directory:

```bash
cp .githooks/pre-commit .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

### Usage

**Normal commit:**
```bash
git commit -m "your message"
# Hook runs automatically and blocks commit if TypeScript errors exist
```

**Skip hook (not recommended):**
```bash
git commit --no-verify -m "your message"
```

### Troubleshooting

**Hook fails:**
1. Fix TypeScript errors shown in output
2. Run `pnpm exec tsc --noEmit` to verify
3. Retry commit

**Hook missing:**
```bash
# Re-copy from .githooks/
cp .githooks/pre-commit .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

## Future: Husky Migration

For better team sharing, consider migrating to Husky:

```bash
pnpm add -D husky
npx husky init
echo "cd apps/nextjs && pnpm exec tsc --noEmit --project tsconfig.precommit.json" > .husky/pre-commit
```

This makes hooks version-controlled and automatically installed.
