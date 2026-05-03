# TICKET: harness-eagle-stage-marker-contract-followups
# Created: 3 May 2026
# Owner: Shon AJ | Brain: VEERABHADRA
# Harness: eagle-harness (meta — improves the harness itself)
# Priority: P1 (after first end-to-end run completes)

## Goal
Convert today's first-pass implementation of Option A (per-stage marker
contract for Mode 3) from "minimum viable + hardcoded stage registry"
into the production-grade shape we'll use for every future ticket.

## Why
Stage 1 of the EAGLE harness shipped Option A in v1 form during the
sidebar-restructure run on 3 May 2026. v1 trades a few rough edges for
shipping the value today. This ticket captures the rough edges so the
next run starts from a cleaner base.

## v1 limitations to fix

1. STAGES come from a hardcoded registry in `harness/eagle/eagle-harness.js`
   (`MODE3_STAGES['<ticket>']`). Adding a new ticket today requires editing
   the harness. Should come from Mode 2 spec output as JSON between markers
   (e.g. `<<<STAGES_JSON>>> ... <<<STAGES_JSON_END>>>`).

2. NEVER-TOUCH list is duplicated in `harness/core/patcher.js` as a string
   array. The single source of truth is `369-brain/CODING-CONSTITUTION.md`
   rule A7. The harness should READ that section, not duplicate it.
   Same architectural principle as the harness README ("source of truth —
   never duplicate"). Today this is a violation of that principle.

3. The stage's `git apply` runs without first verifying the inner Claude's
   patch lines exactly match the file content the harness embedded in the
   prompt. If the file changed between Mode 2 and Mode 3 (rare but possible),
   the patch could apply against drifted content. Add a content-hash check.

4. There is no inter-stage `git diff` review hook. Today the harness logs
   the patch path; Shon must `cat` it manually. Add an option for the
   harness to render a colorised summary diff to stdout when pausing.

5. Stage rejection (rejectStage) reverts the LAST patch only. If multiple
   stages have been applied across a run and Shon decides to reject mid-flow,
   the harness should walk back ALL stages, in reverse order, with explicit
   confirmation per revert.

6. `runSlashCommand` always uses `claude -p`. There is no per-phase override.
   For Mode 1/2 we don't need write tools. For future Mode-3-style stages we
   may want to swap to a different model or pass `--allowedTools "Read"` to
   harden the inner agent further. Add a `runSlashCommand(slashCommand,
   prompt, { allowedTools, model })` signature.

7. The harness has zero tests. Add unit tests for:
   - `extractPatchBetweenMarkers` (happy path, missing markers, empty body)
   - `validatePatch` (NEVER-TOUCH paths, out-of-scope paths, allow-list pass)
   - `parsePorcelainPaths` (M, A, D, ??)
   Run them with `node --test` (built-in node test runner).

8. The post-apply guard treats files dirty BEFORE the stage as "preexisting"
   and ignores them. Make this explicit in the run log so Shon can see
   exactly which files were already dirty when each stage started.

## Out of scope for this ticket
- Mode 4 (Postmortem) automation — separate ticket.
- Multi-tenant `harness_runs` (BCBT etc) — separate ticket.
- Switch from JSONL to MongoDB — Latha's job per harness/README.md.

## Acceptance criteria
- New ticket added to feature-registry.md no longer requires editing
  `harness/eagle/eagle-harness.js`.
- `harness/core/patcher.js` reads NEVER-TOUCH from CODING-CONSTITUTION.md
  rule A7 (parsed once on require).
- `node --test harness/` passes for the patcher and the marker extractors.

## Notes
- Discovered during the first end-to-end EAGLE run (sidebar-restructure,
  run id `fd68945a22254495`, 3 May 2026).
- Reference commit for v1 of Option A: see brain log around 3 May 2026.
