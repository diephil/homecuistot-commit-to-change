# Branching Convention

**CRITICAL**: This project uses numbered feature branches for speckit workflow integration.

## Pattern
`{3-digit-number}-{descriptive-name}`

## Examples
- `001-db-ops`
- `002-deploy-prod`
- `003-auth-improvements` (next)

## Rules
1. Check existing branches to find highest number
2. Use next sequential 3-digit number
3. Format: `NNN-kebab-case-description`
4. Speckit relies on this numbering to match:
   - Branch → `specs/NNN-*/` directory
   - Feature tracking across spec/plan/tasks workflow

## Workflow Trigger
**BEFORE running `speckit.specify`:**
1. Run `git branch` to check highest number
2. Calculate next sequential 3-digit prefix
3. Use that prefix for the new feature branch

## Current Status
- Latest prefix in use: `003`
- Next feature prefix: `004`

**Critical: Always check `git branch` first before `speckit.specify` to determine correct feature number.**
