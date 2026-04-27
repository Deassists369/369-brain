# Files Never to Touch — DeAssists Portal

# Last updated: 27 April 2026

## ABSOLUTE — NEVER MODIFY FOR ANY REASON

apps/cms-next/pages/universitiesd/

  BCBT white-label portal — separate client, separate product entirely

apps/backend-nest/src/core/entities/extendables/payment.entity.ts

  Payment data structure — any change corrupts payment records

apps/mui-cms-next/

  Separate application — not the staff portal

  All portal work is in apps/cms-next/ and libs/shared-ui/ only

MASTER-RUN.cjs

  Google Sheets CRM script — still live, Gopika uses it daily

Any Stripe or payment logic

  Payment processing is Latha's scope only — do not touch

## NEVER COMMIT TO GIT

CLAUDE.md (in deassists repo)

  Lives in 369-brain only — local Claude Code tool, Latha never sees it

Any .env file in any directory

  JWT secrets were exposed once in Git history — never again

pnpm-lock.yaml

  Latha owns the lockfile entirely

.superpowers/ .cursor/ .compound-engineering/

  Tool configuration folders

docs/superpowers/ previews/ specs/ plans/ tmp/

  Tool output folders

Any *.html prototype or preview file

  Lives in 369-brain/prototypes/ — never in deassists repo

## HIGH CAUTION — ONLY WITH LATHA PRESENT ON CALL

apps/backend-nest/src/accounts/ (AccountsController + AccountsService)

  63 edges — most connected file in the entire codebase

  Any change can break authentication for all users simultaneously

libs/shared/functions/permission.helper.ts

  Community 6 — coupled to AccountsController

  Sidebar audit must pass + Latha on call before any push here

apps/backend-nest/src/guards/scope.guard.ts

  Known security bypass at line ~79

  Do not modify until Latha addresses the bypass

## SHARED CONFIG — LATHA APPROVAL REQUIRED BEFORE COMMIT

package.json (root or any app/lib)

.gitignore

.eslintrc or .eslintignore

tsconfig*.json at root level

nx.json

pnpm-workspace.yaml

Adding or upgrading any dependency = Latha approves before commit.
