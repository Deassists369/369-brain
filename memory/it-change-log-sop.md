# DeAssists — IT Change Log SOP
# Permanent addition to all portal and IT work
# Owner: Shon AJ | Brain: VEERABHADRA
# Created: 19 April 2026

---

## THE RULE — NON-NEGOTIABLE FROM 19 APRIL 2026

Every branch we work in has a Change Log file.
Every task we complete gets an entry in that file.
Every PR Latha receives comes with that file attached.

No exceptions. No "we will fill it in later."
The entry is written at Stage 4 — before the commit is made.

---

## WHERE THE FILE LIVES

In 369-brain — not in the portal codebase:

~/deassists-workspace/369-brain/change-logs/BRANCH-CHANGE-LOG-[branch-name].md

Never committed to the deassists portal repo.
Delivered to Latha as a separate file alongside the PR link.

One file per branch. Lives for the full life of that branch.

---

## WHAT GOES IN EVERY ENTRY

After every commit — before pushing — add this to the change log:

### TASK [N] — [Task Name]
**Commit:** [git hash]
**Date:** [date]
**Type:** feat / fix / design / chore / security

**What this is:**
[Two sentences. What was built and why it exists.]

**Files added:**
| File | Action | Compared against reference |
|------|--------|--------------------------|
| [full path] | CREATED | Yes / No — [note] |

**Files modified:**
| File | Action | What changed |
|------|--------|-------------|
| [full path] | MODIFIED | [one line description of change] |

**Files touched in any other way:** None / [list]

**What Latha should verify:**
[Exact URL or command. Exact thing to check. Not vague.]

---

## THE COMPARISON COLUMN — MIGRATION TASKS ONLY

During the portal.shon369 migration, every file entry has a
"Compared against reference" column.

This means: before committing any file, VEERABHADRA compared it
against the code-snapshot in 369-brain/code-snapshot/

Values:
- "Yes — identical" = file is exact copy, no changes
- "Yes — [note]" = file copied but one specific thing adjusted
- "No — rewritten" = file was rebuilt (must explain why)

This column is removed for new features built from scratch.

---

## WHAT LATHA RECEIVES WITH EVERY PR

1. The PR link on GitHub
2. The Change Log file for that branch (downloaded from 369-brain)
3. The WhatsApp handover message (as per the 5-stage SOP)

The Change Log is her map. She does not need to hunt through the
diff to understand what changed. It is all written clearly.

---

## HOW VEERABHADRA MAINTAINS THIS

At Stage 4 of every task — before the commit command is run —
VEERABHADRA adds the entry to the change log.

Shon pastes the entry into the change log file on Mac Mini.
The file is saved in 369-brain/change-logs/

At session end — the change log is committed to 369-brain:
git add change-logs/BRANCH-CHANGE-LOG-[branch-name].md
git commit -m "brain: change log updated — [task name] added"
git push origin main

---

## RUNNING TOTALS — ALWAYS VISIBLE

At the bottom of every Change Log is a running summary table:

| Task | Files Added | Files Modified | Commit |
|------|------------|----------------|--------|
| 1    | N          | N              | [hash] |
| 2    | N          | N              | [hash] |
| TOTAL| N          | N              |        |

This gives Latha an instant view of the full scope of changes
in the branch at any point in time.

---

## FOR NEW FEATURES (not migration)

Same format. Comparison column removed.
Entry written at Stage 4 before commit.
File delivered with every PR.

Additional field for new features:

**Mobile app impact:**
Yes — [what changes for mobile] / No

**API contract change:**
Yes — [endpoint modified] / No

---

## THE DECISION THIS REPLACES

Before: Latha received a PR with 1100+ files and no explanation.
Now: Latha receives a PR with N specific files and a complete map.

This is the permanent standard. It applies to every branch,
every task, every PR, forever.

---

*VEERABHADRA — DeAssists Master Brain*
*IT Change Log SOP — Created: 19 April 2026*
*Applies to: all portal and IT work from this date forward*
