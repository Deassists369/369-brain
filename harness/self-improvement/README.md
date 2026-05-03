# Self-Improvement Harness — v1

# Brain: VEERABHADRA · Owner: Shon AJ
# Capability mode · brain-only · manual trigger only · v1

## What this is

A meta-harness. It reads how the DeAssists brain has been operating —
the canonical SOP files, the eagle-harness run log, the ticket queue,
and a high-level codebase summary — and asks one structured LLM call:

> What patterns are emerging? What's recurring? What concrete fixes
> (skill rules, source-file edits, or new patterns) would prevent
> recurring problems?

It writes a markdown analysis report, appends one new dated section to
`intelligence/LEARNING-MIND.md`, and logs one JSONL row with the same
schema as the eagle harness. Mission Control's existing
**Self-Improvement — Intelligence Reports** panel picks it up
automatically.

## What this is NOT

- **Not a fixer.** It produces proposals. Shon decides what to act on.
- **Not autonomous.** No cron, no hooks, no auto-trigger in v1.
- **Not stateful.** Each run is independent. The history lives in the
  appended LEARNING-MIND sections and the JSONL log.
- **Not a portal touchpoint.** Brain-only. Zero files in `~/deassists/`
  are read or written.

## How to invoke

```bash
# normal analysis run
node ~/deassists-workspace/369-brain/harness/self-improvement/self-improvement-harness.js

# dry run — assemble the prompt, print it, do not call Claude
node ...self-improvement-harness.js --dry-run

# skip the LEARNING-MIND append
node ...self-improvement-harness.js --skip-learning-mind

# only consider the most recent N eagle-harness entries (default: all)
node ...self-improvement-harness.js --limit-runs 20

# help
node ...self-improvement-harness.js --help
```

Exit codes:

- `0` complete
- `1` failed mid-run (analyzer error, write error, etc.)
- `2` blocked — a Tier-1 SOP file was missing

## Inputs (read-only)

| Source | Path | Notes |
|---|---|---|
| SOP file 1 | `AGENTS.md` | brain-root |
| SOP file 2 | `CLAUDE.md` | brain-root · boot sequence |
| SOP file 3 | `CODING-CONSTITUTION.md` | brain-root · 18 coding rules |
| SOP file 4 | `HOOKS.md` | brain-root |
| SOP file 5 | `THE-DEASSISTS-OS.md` | brain-root · foundational ops |
| Harness runs | `intelligence/harness-runs/eagle-harness.jsonl` | one JSON per line |
| Ticket queue | `tickets/{open,waiting,awaiting-approval,complete}/*.md` | all four buckets |
| Codebase summary | `harness/`, `project/`, `skills/`, `intelligence/`, `patterns/`, `commands/`, `agents/` | listings + byte counts only — no file content |
| Google Doc | _waived for v1_ | future v2 may pull via Drive MCP |

## Outputs

### Output 1 — analysis report

`intelligence/proposed-fixes/[YYYY-MM-DD]-self-improvement-run-[NNN].md`

Contains six required sections:

1. `DEEPENED UNDERSTANDING`
2. `WRONG ASSUMPTIONS CORRECTED`
3. `PATTERNS IDENTIFIED`
4. `PROPOSED FIXES`
5. `OPEN QUESTIONS FOR VEERABHADRA`
6. `CHALLENGE FOR NEXT SESSION`

Plus an `EVIDENCE INDEX` footer citing run_ids, SOP files, and ticket
files.

The harness refuses to overwrite an existing report — the run number
auto-increments to the next available `NNN` for the date.

### Output 2 — LEARNING-MIND append

A new dated section is appended at the bottom of
`intelligence/LEARNING-MIND.md`. Append-only: previous content is
byte-equal at the top of the file after every write. Uses the existing
template (SESSION / DEEPENED UNDERSTANDING / WRONG ASSUMPTIONS /
PATTERNS / OPEN QUESTIONS / CHALLENGE FOR NEXT SESSION).

### Output 3 — run log row

One JSONL row appended to
`intelligence/harness-runs/self-improvement-harness.jsonl`. Same shape
as `eagle-harness.jsonl` (schema in `harness/README.md`):

```json
{
  "run_id": "...", "harness": "self-improvement-harness",
  "feature": "self-improvement-harness-v1",
  "started_at": "...", "completed_at": "...",
  "status": "complete" | "failed" | "blocked",
  "phases": [ { phase, status, detail, timestamp }, ... ],
  "meta": { sop_files_read, harness_runs_read, tickets_read,
            patterns_found, proposed_fixes, report_path,
            learning_mind_appended }
}
```

## Phases

The harness logs seven phases per run, each with `running` →
`complete` (or `failed`):

1. `read-sops`
2. `read-harness-runs`
3. `read-tickets`
4. `build-prompt`
5. `invoke-analyzer`
6. `write-report`
7. `append-learning-mind` (or `skipped` if `--skip-learning-mind`)

If `read-sops` finds any of the five SOP files missing, the run records
`status: blocked`, exits with code 2, and writes nothing else.

## Architecture

| File | Role |
|---|---|
| `inputs.js` | Pure file readers — SOPs, harness runs, tickets, codebase summary |
| `report-writer.js` | Produces the markdown report; refuses overwrites |
| `learning-mind-writer.js` | Append-only LEARNING-MIND writer |
| `analyzer.js` | Builds the structured prompt; invokes `claude -p`; parses JSON between markers |
| `self-improvement-harness.js` | CLI entry point + orchestration |
| `__tests__/*.test.js` | node:test coverage for the three S1 modules |

`harness/core/logger.js` is reused as-is for the JSONL run log.

## Running the tests

```bash
cd ~/deassists-workspace/369-brain
node --test \
  harness/self-improvement/__tests__/inputs.test.js \
  harness/self-improvement/__tests__/report-writer.test.js \
  harness/self-improvement/__tests__/learning-mind-writer.test.js
```

## Mission Control wiring

Mission Control's existing **Self-Improvement — Intelligence Reports**
panel reads `intelligence/harness-runs/self-improvement-harness.jsonl`
and updates the `s-learn` stat automatically. No HTML change is
required.

## Out of scope for v1

- Cron / scheduled triggering
- Hook-based triggering (post-eagle-run, etc.)
- Google Doc input
- Auto-applying proposed fixes
- Auto-closing the harness's own ticket on success
- HTML output of the report
- MongoDB migration of the run log (stays JSONL until June 2026)

## Locked Mode 1 answers

- Mode: **CAPABILITY** (no UI)
- SOP files: **all five**
- Google Doc: **WAIVED v1**
- Registry row: **yes** (line 263 of `project/feature-registry.md`)
- Trigger: **MANUAL only for v1**
- LEARNING-MIND: **APPEND only** (never edit existing)
