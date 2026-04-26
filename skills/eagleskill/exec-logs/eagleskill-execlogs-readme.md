# EAGLESKILL — Execution Logs Directory

This directory holds execution logs from EAGLE Mode 3 (Execute).
Each log records what actually happened when an approved preview was
written to production code.

## Naming convention

```
eagle-execlog-[YYYY-MM-DD]-task-[N]-[name-kebab].md
```

Examples:
- `eagle-execlog-2026-04-27-task-1-design-tokens.md`
- `eagle-execlog-2026-05-03-task-2-backend-entity-id-service.md`
- `eagle-execlog-2026-05-10-task-3-leads-module.md`

Note: date comes RIGHT AFTER the type prefix in this folder, because
execution logs are most usefully sorted chronologically (you usually
want "what happened today" or "what happened this week").

## What goes here

Per-task execution records:
- Pre-flight check results (git status, branch state)
- Files actually written (paths + line counts)
- Commands actually run (in order)
- Compilation results (errors before / after)
- Any deviations from the preview (with explanation)
- Prototype paired update record
- Stage 3 verification handoff details (what URL Shon should test,
  what role to test as, what behavior to confirm)

## What does NOT go here

- Gap reports (`../reports/`)
- Plans (`../plans/`)
- Previews (`../previews/`)
- The change log entry (lives in `369-brain/change-logs/`)

## When EAGLE deviates from a preview

If EAGLE finds during Mode 3 that the preview was inaccurate (file not
where expected, missing dependency, wrong type signature, etc.), the
execution log records:

1. What EAGLE expected (from the approved preview)
2. What EAGLE actually found
3. Whether EAGLE stopped (correct response) or proceeded
4. If proceeded — what was changed and exactly why

EAGLE should default to STOPPING when a preview is wrong. Proceeding
without preview revision is only OK for trivial corrections (typo in
import path, missing semicolon that was always going to be needed).
Anything that affects logic, structure, or scope must trigger a STOP.

## Why these matter

Latha sees the change log; she doesn't usually see this folder. But
if a task goes wrong post-merge — bug in production, regression
discovered later — the execution log is where Shon checks what
actually happened during the build.

This is also where the audit trail for the add-only rule lives:
every execlog should explicitly state "no existing logic was modified
during this execution" or — if for some reason the rule was relaxed
with explicit VEERABHADRA approval — exactly what was modified, why,
and which decision authorized it.

## Pattern note

Date placement: at the start of the topic portion (after `eagle-execlog-`)
so chronological sort surfaces recent work first. This differs from
reports (where date is at the end) because execlogs are most often
reviewed as "what did we do recently" rather than "what did we do
about feature X."
