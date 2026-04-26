# EAGLESKILL — Reports Directory

This directory holds gap reports produced by EAGLE Mode 1 (Read-Only,
per-task gap analysis).

## Naming convention

```
eagle-report-[scope-kebab]-[YYYY-MM-DD].md
```

Examples:
- `eagle-report-task-1-design-tokens-2026-04-27.md`
- `eagle-report-tenant-model-gap-2026-05-03.md`
- `eagle-report-sidebar-permissions-2026-05-10.md`

## What goes here

Mode 1 outputs only:
- Per-task gap reports comparing prototype intent to cms-next reality
- Investigation summaries before any plan
- Read-only audits of specific features

## What does NOT go here

- The Mode 0 baseline readout — that lives at the skill root as
  `eagle-baseline-system-readout.md` (it's permanent, not episodic)
- Plans (those live in `../plans/` as `eagle-plan-...md`)
- Previews (those live in `../previews/`)
- Execution logs (those live in `../exec-logs/`)
- Brain files (those live in `~/deassists-workspace/369-brain/memory/`)

## Why these are saved

- **Audit trail** — Latha or future-Shon can read what EAGLE found
  before any code direction was committed
- **Reviewable later** — if a migration task goes wrong post-merge,
  the gap report shows what was known at planning time
- **Sharable** — Shon can attach a gap report to a Latha conversation
  alongside the eventual PR

## Retention

Keep all reports indefinitely. They're cheap to store and valuable
when something needs to be revisited months later.

## Pattern note

Date is in the **middle** of the filename (after the type prefix,
before the topic). This sorts files chronologically WITHIN this folder.
The `eagle-report-` prefix means a directory-wide search for
`eagle-report-` finds every Mode 1 output across all dates.
