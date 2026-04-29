# EAGLESKILL — Folder Structure and File Conventions
# Save to: ~/deassists-workspace/369-brain/skills/eagleskill/README.md
# Last updated: 29 April 2026
# Skill version: v2.1

This README explains what lives in this folder, the naming conventions
for each file type, and how the pieces fit together. It does NOT
duplicate operational rules — those live in `EAGLESKILL.md` and
`eagleskill-config.md`.

---

## QUICK START

If you're a fresh Claude Code session activating EAGLE for the first
time on Mac Mini:

```
1. Read EAGLESKILL.md (universal pattern — the rules)
2. Read eagleskill-config.md (DeAssists project configuration)
3. Read eagle-baseline-system-readout.md (current codebase state)
4. Wait for Shon to specify which mode to enter
```

Don't write anything to production until you've completed all three reads
and Shon has explicitly approved a Mode 2 working prototype.

---

## FOLDER STRUCTURE

```
skills/eagleskill/
├── README.md                                    ← this file
├── EAGLESKILL.md                                ← universal pattern (1,172 lines, the skill itself)
├── eagleskill-config.md                         ← DeAssists project config (440 lines)
├── eagle-baseline-system-readout.md             ← Mode 0 baseline (current)
├── eagle-baseline-system-readout-[YYYY-MM-DD].md  ← previous baselines (archived when superseded)
├── eagle-v2.1-decision-audit-2026-04-29.md      ← design audit for v2.1 lock
│
├── reports/                                     ← Mode 1 outputs (gap reports per loop round)
├── plans/                                       ← Mode 2 outputs (specs)
├── previews/                                    ← Mode 2 working prototypes (HTML + paired markdown)
└── exec-logs/                                   ← Mode 3 outputs (stage reports + final execution logs)
```

---

## THE TWO PRIMARY DOCUMENTS

### `EAGLESKILL.md` — THE SKILL

The universal pattern. Defines:
- Identity, scope, trigger phrases
- Golden rules (what EAGLE never violates)
- Two resolution modes (MIGRATION vs CAPABILITY, declared at start of every Mode 1)
- Five modes (Baseline / Reconcile / Spec / Execute / Postmortem)
- Add-only rule, no-hardcoding rule, matched-test rule
- Skill activation table
- Plugin discipline
- File naming conventions

This file is portable. Same content works on any project. Don't modify
it for project-specific reasons — modify `eagleskill-config.md` instead.

### `eagleskill-config.md` — THE PROJECT CONFIG

DeAssists-specific configuration EAGLE reads alongside the universal
pattern. Defines:
- Repository paths (369-brain + deassists)
- Production codebase structure (apps/, libs/)
- People (12 names with roles and access)
- Never-touch files list
- Three-tier required reading list (with exact paths)
- File output paths per mode
- Coordinating skills (sidebar-audit, uiux-superman)
- Plugin availability and forbidden list
- Active blockers
- Mode 0 re-run triggers

When deploying EAGLE to a different project, this is the only file that
changes. The universal `EAGLESKILL.md` stays the same.

---

## THE BASELINE READOUT

`eagle-baseline-system-readout.md` is the output of Mode 0. It captures
EAGLE's deep understanding of the codebase — architecture, role system,
risk registry, design tokens, hardcoding audit, never-touch list.

**Permanent name** (no date in filename) means the current-version baseline
always lives at this path. When superseded by a new Mode 0 run:

```
Old file renamed: eagle-baseline-system-readout-[YYYY-MM-DD].md
New file created: eagle-baseline-system-readout.md
```

The old file is **kept, never deleted**. Past baselines are reference
material for postmortems and for understanding when changes drifted.

Mode 0 re-runs are triggered by:
- A new top-level folder appears in apps/
- A new core entity is added
- user.types.ts is modified
- permission.helper.ts logic changes
- Major refactor announced
- More than 60 days since last Mode 0
- Explicit Shon instruction

---

## THE DECISION AUDIT

`eagle-v2.1-decision-audit-2026-04-29.md` is the audit document from the
29 April session that locked v2.1. It captures all 16 design decisions
with cross-consistency check.

This document is preserved permanently. Future v2.2 / v3.0 work will
produce its own audit; old audits accumulate as historical record.

---

## SUBFOLDERS — WHAT GOES WHERE

Each EAGLE mode produces files into a specific subfolder. The naming
conventions are LOCKED — EAGLE always uses these patterns.

### `reports/` — Mode 1 Output

Gap reports produced by Mode 1 (Reconcile). One file per loop round.

```
Naming:   eagle-report-round-[N]-[topic-kebab]-[YYYY-MM-DD].md
Examples: eagle-report-round-1-leads-module-2026-05-03.md
          eagle-report-round-2-leads-module-2026-05-03.md
          eagle-report-round-1-tenant-model-2026-05-10.md
```

Multiple files per capability (one per round). Files are kept indefinitely
as audit trail.

### `plans/` — Mode 2 Output

Specs produced by Mode 2 (Spec). One file per capability.

```
Naming:   eagle-spec-[capability-kebab]-[YYYY-MM-DD].md
Examples: eagle-spec-leads-module-2026-05-03.md
          eagle-spec-q-intelligence-2026-05-10.md
```

Each spec is the deliverable contract — what's identical, what's being
created, what the final output is, and the stage plan for Mode 3.

### `previews/` — Mode 2 Output (Working Prototypes)

Working HTML prototypes produced by Mode 2 (Spec). PAIRED files: HTML
plus matching markdown. Both share the same base name.

```
Naming:   eagle-working-prototype-[capability-kebab]-[YYYY-MM-DD].html
          eagle-working-prototype-[capability-kebab]-[YYYY-MM-DD].md
Examples: eagle-working-prototype-leads-module-2026-05-03.html
          eagle-working-prototype-leads-module-2026-05-03.md
```

The HTML is the visual review artifact (open in browser). The markdown
is the durable record (used in commit handoff to Latha).

Why two formats: Shon is non-developer. Reading raw code diffs is harder
than seeing a working interactive prototype. The HTML is what gets
reviewed; the markdown is the archive.

**Approval discipline** for previews lives in `EAGLESKILL.md` Mode 2
section. Three approval phrases: `approved` / `not approved` /
`I have a doubt: [...]`. Any other response — EAGLE refuses to proceed.

### `exec-logs/` — Mode 3 Output

Execution logs produced by Mode 3 (Execute). Records what actually
happened during staged execution, including per-stage reports.

```
Naming:   eagle-execlog-[YYYY-MM-DD]-[capability-kebab].md
Examples: eagle-execlog-2026-05-03-leads-module.md
          eagle-execlog-2026-05-10-q-intelligence.md
```

Date placement at start of topic (after `eagle-execlog-`) so chronological
sort surfaces recent work first. This differs from reports (where date
is at end) because execlogs are most often reviewed as "what did we do
recently" rather than "what did we do about feature X."

Each execlog contains:
- Pre-flight check results (git status, branch state)
- Per-stage reports (what was written, what was tested, pass/fail)
- Files actually written (paths + line counts)
- Commands actually run (in order)
- Compilation results
- Any deviations from the spec (with explanation)
- Final capability completion report
- The change log entry sent to Latha

### `postmortems/` — Mode 4 Output (Created on First Use)

Postmortem reports produced by Mode 4 (Postmortem). One file per bug
that surfaced in EAGLE-built work.

```
Naming:   eagle-postmortem-[YYYY-MM-DD]-[bug-kebab].md
Examples: eagle-postmortem-2026-06-15-queue-routing-edge-case.md
```

This folder gets created on first postmortem (doesn't exist yet).

Postmortems propose updates to:
- Source files EAGLE was reading at the time
- The skill itself (EAGLESKILL.md or eagleskill-config.md)
- New patterns or coordinating skills

These updates flow through the same preview-and-approve cycle as
production code changes.

---

## FILE NAMING — THE LOCKED PATTERNS

```
Permanent files (no date):
  EAGLESKILL.md
  eagleskill-config.md
  eagle-baseline-system-readout.md
  README.md (this file)

Episodic outputs (one per task or invocation):
  eagle-report-round-[N]-[topic]-[YYYY-MM-DD].md     in reports/
  eagle-spec-[capability]-[YYYY-MM-DD].md            in plans/
  eagle-working-prototype-[capability]-[YYYY-MM-DD].html  in previews/
  eagle-working-prototype-[capability]-[YYYY-MM-DD].md    in previews/
  eagle-execlog-[YYYY-MM-DD]-[capability].md         in exec-logs/
  eagle-postmortem-[YYYY-MM-DD]-[bug].md             in postmortems/

Archived:
  eagle-baseline-system-readout-[YYYY-MM-DD].md      (old baselines)
  eagle-vN.M-decision-audit-[YYYY-MM-DD].md          (audits at version locks)

Pattern rules:
  - Every EAGLE-produced file starts with "eagle-" (lowercase)
  - File type is the second segment (report / spec / working-prototype /
    execlog / postmortem / baseline)
  - Topics in kebab-case
  - Dates in ISO format (YYYY-MM-DD)
  - Permanent reference docs (skill rules, current baseline, README)
    have no date in the filename
```

---

## RETENTION POLICY

```
Keep indefinitely:
  - All reports, specs, previews, execlogs, postmortems
  - All decision audits
  - All archived baselines (with date in filename)
  - Old EAGLESKILL versions (when archived during version locks)

Why: the full chain — baseline → gap reports → spec → working prototype →
execlog → change log → commit — is the audit trail for every production
change EAGLE produces. If a bug surfaces months later, the chain is
how Mode 4 Postmortem traces what happened.

Storage cost is essentially free; audit value is real.
```

---

## CROSS-REFERENCES

Where to find things mentioned in this README:

```
The skill itself:                  EAGLESKILL.md
Project config:                    eagleskill-config.md
Current Mode 0 baseline:           eagle-baseline-system-readout.md
Current decision audit:            eagle-v2.1-decision-audit-2026-04-29.md
Locked decisions table:            ~/deassists-workspace/369-brain/memory/decisions.md
Current session state:             ~/deassists-workspace/369-brain/memory/session-state.md
Brain rules for Claude Code:       ~/deassists-workspace/369-brain/CLAUDE.md
VEERABHADRA charter:               ~/deassists-workspace/369-brain/VEERABHADRA.md
Foundational ops doc:              ~/deassists-workspace/369-brain/THE-DEASSISTS-OS.md
```

---

## VERSION HISTORY

```
README v1.0 — 29 April 2026
  Created during EAGLE v2.1 lock session.
  Replaces 4 separate subfolder readmes with this single root document
  for clearer maintenance and better GitHub auto-rendering.

  Previous (v2.0-era) readmes:
    reports/eagleskill-reports-readme.md       (deleted 29 April 2026)
    plans/eagleskill-plans-readme.md           (deleted 29 April 2026)
    previews/eagleskill-previews-readme.md     (deleted 29 April 2026)
    exec-logs/eagleskill-execlogs-readme.md    (deleted 29 April 2026)
  
  These were merged and updated for v2.1 mode names. Operational rules
  that lived in those readmes (approval phrases, deviation handling,
  retention policy) are now consolidated either into EAGLESKILL.md
  itself or into this README.
```

---

*EAGLESKILL Folder Structure & File Conventions*
*Last updated: 29 April 2026*
*Skill version: v2.1*
