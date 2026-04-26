# EAGLESKILL — Plans Directory

This directory holds Stage 1 plans produced by EAGLE Mode 2 (Plan-Only,
after a gap report has been approved).

## Naming convention

```
eagle-plan-task-[N]-[name-kebab].md
```

Examples:
- `eagle-plan-task-1-design-tokens.md`
- `eagle-plan-task-2-backend-entity-id-service.md`
- `eagle-plan-feature-bcbt-flat-fee.md`  (for non-numbered features)

Note: plans typically don't have dates in the filename because there's
usually one plan per task. If a plan is revised, the old one moves to
`eagle-plan-task-N-name-superseded-[YYYY-MM-DD].md` (kept, never deleted).

## What goes here

Mode 2 outputs:
- Stage 1 plans (one per task)
- Files to create / modify-add-only / never touch
- Verification steps for Stage 3
- Change log entry drafts (PLANNED state, no commit hash yet)
- Latha pre-brief drafts (when files > 3)
- Prototype paired-update plans

## What does NOT go here

- Gap reports (`../reports/` — start with `eagle-report-`)
- Previews (`../previews/` — start with `eagle-preview-`)
- Execution logs (`../exec-logs/` — start with `eagle-execlog-`)

## Lifecycle

1. EAGLE Mode 1 produces a gap report (in `../reports/`)
2. Shon reviews → "approved, produce the plan"
3. EAGLE Mode 2 produces a plan, saved here
4. EAGLE Mode 2.5 produces the preview (in `../previews/`)
5. Shon types "approved" → EAGLE Mode 3 executes
6. Plan stays here as the spec for what was supposed to happen
7. Execution log in `../exec-logs/` records what actually happened

## When plan and execution differ

Document the divergence in the execution log, not by editing the plan.
Update the plan only if Shon explicitly approves a revision (the plan
is the contract for the work, not a draft).

## Pattern note

No date in filename because plans are typically one-per-task. Topics
go in kebab-case. Task numbers prefixed with `task-` for sortability.
