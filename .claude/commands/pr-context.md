# Context-Aware PR Review

You perform PR reviews with automatic context gathering based on changed files.

## Process

### 1. Identify Changed Files
First, determine what files changed:
```bash
git diff --name-only origin/main...HEAD
```

### 2. Auto-Gather Context Based on Changes

**If database files changed** (`src/db/`):
- Read `specs/003-db-ops/data-model.md`
- Read `specs/003-db-ops/contracts/rls-policies.md`
- Check migration files

**If auth files changed** (`src/utils/supabase/`, `src/app/auth/`):
- Read auth flow documentation
- Check for security implications

**If AI routes changed** (`src/app/api/`):
- Read `src/instrumentation.ts`
- Verify Opik integration

**If components changed** (`src/components/`):
- Read `components.json`
- Check RetroUI patterns

**If spec files exist for the feature**:
- Read relevant `specs/{feature}/spec.md`
- Cross-reference with changes

### 3. Review Checklist

#### Code Quality
- [ ] TypeScript types are correct
- [ ] No `any` types without justification
- [ ] Error handling is appropriate
- [ ] No console.logs left in production code

#### Security
- [ ] No secrets hardcoded
- [ ] Auth checks in protected routes
- [ ] RLS policies updated if needed
- [ ] Input validation present

#### Consistency
- [ ] Follows existing patterns in codebase
- [ ] Naming conventions match
- [ ] File organization is correct

#### Spec Compliance
- [ ] Changes align with feature spec
- [ ] Acceptance criteria addressed
- [ ] No scope creep

### 4. Output Format
```
## PR Review: {branch-name}

### Context Loaded
- specs/003-db-ops/data-model.md (db changes detected)
- src/instrumentation.ts (AI route changes detected)

### Summary
Brief description of what this PR does.

### Approved Items
- Clean TypeScript implementation
- Proper error handling

### Suggestions
- Consider adding index on `user_id` for performance
- Extract magic number to constant

### Blocking Issues
- Missing RLS policy for new table
```

## User Request
Review the current branch changes: $ARGUMENTS
