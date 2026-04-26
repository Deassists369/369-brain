# EAGLESKILL — Previews Directory

This directory holds visual approval previews produced by EAGLE Mode 2.5.

This is the most important directory in the skill. **No production code
gets written without a preview here that Shon has explicitly approved.**

## Naming convention

```
Markdown:   eagle-preview-task-[N]-[name-kebab]-[YYYY-MM-DD].md
HTML:       eagle-preview-task-[N]-[name-kebab]-[YYYY-MM-DD].html
```

Both files for the same preview share the same base name, only the
extension differs. They are paired — always saved together.

Examples:
```
eagle-preview-task-1-design-tokens-2026-04-27.md
eagle-preview-task-1-design-tokens-2026-04-27.html

eagle-preview-task-3-leads-module-2026-05-03.md
eagle-preview-task-3-leads-module-2026-05-03.html
```

Why include the date in the filename: previews are immutable contracts.
If a preview is rejected and EAGLE produces a revised one, the new file
gets the new date. Both stay on disk for audit.

## What goes here

- Paired markdown + HTML files per preview round
- One pair per task per approval round
- HTML files render cleanly in any modern browser, offline

## What does NOT go here

- Plans (`../plans/`)
- Execution logs (`../exec-logs/`)
- Reports (`../reports/`)

## Why two formats

Shon is a non-developer. Reading raw code diffs in markdown is harder
than seeing color-coded changes in a browser. So:

- **HTML** — for visual review. Open in browser. Color-coded.
  Side-by-side before/after. Live-rendered preview of any UI changes.
  Approval section visible at the bottom.
- **Markdown** — for archive, for sending to Latha alongside the PR,
  for grep, for terminal viewing.

The HTML is what gets reviewed. The markdown is the durable record.

## Preview structure

Every preview HTML file has ten sections in this exact order:

1. **Header** — task name, date, version
2. **What is changing** (plain English, 2-4 sentences)
3. **Prototype intent** (with rendered snippet of the prototype source)
4. **Code changes** (per-file with green highlights for additions)
5. **Existing logic touched** (the add-only transparency check)
6. **What this could break** (honest risk assessment)
7. **Visual rendering** (for frontend changes only — actual rendered HTML)
8. **Verification steps** (URLs, roles, expected behavior)
9. **Rollback plan** (single git revert command)
10. **Approval** (the three approval phrases shown visually)

If section 5 finds existing-logic modification, the preview is replaced
with a big red "EAGLE STOPPED" page. No approval section. No production
code path possible. Shon returns to VEERABHADRA.

## Approval phrases

After opening a preview, Shon types ONE of these in Claude Code:

```
approved                              → EAGLE moves to Mode 3
not approved                          → EAGLE returns to Mode 2 to revise
I have a doubt: [specific question]   → EAGLE answers, awaits new response
```

Anything else ("yes", "go", "ok", "looks fine", "send it", "approve") —
EAGLE refuses to proceed. The skill outputs:

> "I need an explicit response. Please say 'approved', 'not approved',
>  or 'I have a doubt: [question]'."

This is non-negotiable. The exact phrase requirement protects against
rubber-stamp approvals.

## Multiple doubt rounds

Shon can ask doubts multiple times. Example flow:

```
Round 1:
  EAGLE: "Preview ready. Open: previews/eagle-preview-task-1-...html"
  Shon: "I have a doubt: why is #1D7A45 not in the existing MUI theme?"
  EAGLE: [explains with reasoning]
         "Does this resolve your doubt? Respond with 'approved',
          'not approved', or another doubt."

Round 2:
  Shon: "I have another doubt: will this break the existing theme provider?"
  EAGLE: [explains]
         "Does this resolve your doubt?"

Round 3:
  Shon: "approved"
  → EAGLE moves to Mode 3.
```

EAGLE handles unlimited rounds. There's no limit on how many doubts
Shon can have before approving. The skill's job is to answer them
honestly until Shon is genuinely confident.

## When previews go wrong

If during execution (Mode 3) EAGLE discovers the preview was inaccurate
(e.g. file path wrong, dependency missing, type signature different
from what was shown), EAGLE STOPS execution. Reverts any partial changes.
Outputs:

> "Preview was inaccurate at [point]. Found [actual state] vs preview's
>  [shown state]. No code committed. Returning to Mode 2 to revise plan."

Then a new plan + new preview is produced. Shon approves the new one.
Old preview stays on disk as audit record.

## Retention

Keep all previews indefinitely. The full chain — gap report → plan →
preview → execution log → change log → commit — is the audit trail
for every production change.
