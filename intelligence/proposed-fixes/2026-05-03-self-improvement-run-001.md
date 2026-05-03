# Self-Improvement Run 001 — 2026-05-03
# Harness: self-improvement-harness-v1
# Run ID: 65e91376baf32d2a
# Duration: 80.1s
# Inputs: 5 SOPs · 8 harness-run entries · 7 tickets

---

## DEEPENED UNDERSTANDING

- The eagle-harness Mode 3 stage execution has a structural conflict between its 'add-only' enforcement guard and the harness's own self-modification needs. Run b18cb4fea3eafbea failed because the patcher legitimately needed to write to harness/__tests__/ and intelligence/harness-runs/output/, but the post-apply guard flagged these as out-of-scope. The carve-out documented in tickets/open/harness-eagle-stage-marker-contract.md (Mode 1 review answer #2) has been agreed but not yet codified in the guard.
- Three of seven runs (rag-foundation-v1, playwright-full-test-suite ×2) blocked at data-check phase, indicating data-readiness classification is correctly gating premature builds — the harness is doing its job preventing State 2A/2B features from skipping straight to Mode 1.
- The harness has produced exactly one corrupted run record (run_id=undefined, feature=?, phases=none) — JSONL ingestion or run initialization has a code path that writes a row before the run object is fully constructed.
- Two runs of harness-eagle-stage-marker-contract were started ~90 min apart (b18cb4fe at 19:34, e0d4365a at 21:11). The second run reset to awaiting-approval at Mode 1, suggesting a re-attempt after the Stage 1 patcher failure rather than a Mode 3 retry — there is no Mode 3-only resume path.
- Five of the eight log entries are for features that never reach Mode 3 (4 blocked at data-check, 1 awaiting Mode 1 approval, 1 awaiting Mode 2). Only one feature — harness-eagle-stage-marker-contract — has been driven through Mode 3, and it failed on its first stage. The harness has minimal Mode 3 production data.

## WRONG ASSUMPTIONS CORRECTED

- Initial assumption that Mode 3 add-only enforcement should apply uniformly to all paths. Reality: harness self-modification tickets need a documented carve-out (per Mode 1 answer #2 in harness-eagle-stage-marker-contract.md). Without codifying this carve-out in the guard, every harness-on-harness ticket will fail Stage 1.
- Initial assumption that ticket priority parsing exists. Reality: harness-worker-ticket-ordering.md (waiting bucket) documents that worker picks tickets in filesystem order, which is non-deterministic on macOS. This means rag-foundation-v1 and playwright-full-test-suite (both legitimately blocked) consume worker cycles before higher-priority tickets like harness-eagle-stage-marker-contract.
- Implicit assumption that the JSONL run log is the source of truth. Reality: one run_id=undefined entry corrupts log parsing and any analytics built on top — the writer doesn't validate run_id presence before append.
- Assumption that 'awaiting-approval' is a terminal state needing human intervention. Reality: there is no documented mechanism in the SOPs for an asynchronous approval signal back to the harness (e.g., file-watcher, webhook, or polling), so awaiting-approval runs will accumulate indefinitely until manually re-triggered.

## PATTERNS IDENTIFIED

- Pattern A — Data-check blocks dominate: 3 of 8 runs (37.5%) terminate at data-check:blocked. This is healthy gating but indicates the feature backlog (rag-foundation-v1, playwright-full-test-suite) was queued without first running /data-check manually, violating CODING-CONSTITUTION.md A16 (verify before building).
- Pattern B — Mode 3 stage failures cluster around scope guards, not code generation. The single Mode 3 failure (b18cb4fea3eafbea) was a guard rejection of legitimate writes, not a patch-generation or apply error. This suggests guard logic — not Claude's diff quality — is the current Mode 3 bottleneck.
- Pattern C — Re-runs of the same feature do not preserve prior phase state. e0d4365af326ec08 (second harness-eagle-stage-marker-contract run) restarted at data-check instead of resuming at Mode 3 Stage 1 retry. Wasted work each time a stage fails.
- Pattern D — Approval-gated features lack visible TTL or staleness markers. f64428257aa78ef9 (self-improvement-harness-v1) and e0d4365af326ec08 sit in awaiting-approval with no completion timestamp; nothing in the JSONL signals whether they're 1 hour old or 1 week old to a future analyzer.
- Pattern E — Tickets in tickets/open/ contain answers for review questions inline (e.g., harness-eagle-stage-marker-contract.md has Mode 1 answers from Shon dated 3 May 2026), but those answers are not yet propagated into harness configuration. There's no mechanism to detect 'ticket has unprocessed approval embedded'.

## PROPOSED FIXES

### Fix 1. Codify harness self-modification carve-out in Mode 3 post-apply guard
- **Category:** source file
- **Severity:** HIGH
- **Evidence:** Run b18cb4fea3eafbea failed at mode3-mode3-s1-patcher-tests with error: 'Post-apply guard: out-of-scope paths modified: harness/__tests__/, intelligence/harness-runs/output/...'. Yet tickets/open/harness-eagle-stage-marker-contract.md Mode 1 answer #2 explicitly approves this: 'EAGLE add-only rule does not apply to harness/** when the harness itself is the subject of the ticket.'
- **Proposal:** In harness/eagle/eagle-harness.js (and the post-apply guard module it calls), add a per-ticket scope manifest. When ticket front-matter declares `subject: harness` or path matches `harness-*`, allow writes to harness/**, intelligence/harness-runs/output/**, and harness/__tests__/**. Portal code (apps/**, libs/**) and brain memory/decisions/patterns must remain add-only regardless of subject.
- **Suggested ticket:** `harness-eagle-stage-marker-contract`

### Fix 2. Validate run_id before JSONL append; reject malformed run records
- **Category:** source file
- **Severity:** MED
- **Evidence:** intelligence/harness-runs/eagle-harness.jsonl contains an entry with run_id=undefined, feature=?, started=undefined, no phases. This corrupts any analytics, dashboard, or self-improvement reader of the JSONL.
- **Proposal:** In the JSONL writer (likely in harness/eagle/eagle-harness.js), guard the append call with: if (!run.run_id || !run.feature || !run.started) { throw new Error('Refusing to write malformed run record: ' + JSON.stringify(run)); }. Then add a one-off cleanup step to remove the existing undefined row.
- **Suggested ticket:** `self-improvement-harness-v1`

### Fix 3. Implement priority-ordered ticket selection in harness-worker
- **Category:** source file
- **Severity:** MED
- **Evidence:** tickets/waiting/harness-worker-ticket-ordering.md documents that worker uses filesystem order on macOS, which is non-deterministic. With 5 open tickets and 3 of them legitimately blocked at data-check, the worker wastes cycles on already-blocked tickets before reaching actionable ones.
- **Proposal:** Implement the fix already drafted in the waiting ticket: parse CRITICAL/HIGH/MEDIUM/LOW from ticket front-matter, sort tickets by priority then alphabetically, pick first. Move ticket from waiting/ to open/ once implemented. Also add a 'blocked' bucket so the worker skips tickets it already classified as data-check:blocked instead of re-running them every cycle.
- **Suggested ticket:** `harness-worker-ticket-ordering`

### Fix 4. Add resume-from-stage capability to Mode 3
- **Category:** skill rule
- **Severity:** MED
- **Evidence:** Two runs (b18cb4fea3eafbea and e0d4365af326ec08) targeted the same feature harness-eagle-stage-marker-contract. The second run restarted at data-check rather than resuming at the failed Stage 1, repeating ~90 min of phase work that had already passed.
- **Proposal:** Update skills/eagleskill/EAGLESKILL.md to document a Mode 3 resume contract: when run_id is provided to /eagle-mode3 with --resume, harness reads the prior JSONL row, validates Modes 1 and 2 are complete, and starts at the next non-complete stage. Implementation lives in harness/eagle/eagle-harness.js — add a --resume <run_id> flag.
- **Suggested ticket:** `harness-eagle-stage-marker-contract`

### Fix 5. Pre-flight /data-check before adding to tickets/open/
- **Category:** new pattern
- **Severity:** MED
- **Evidence:** rag-foundation-v1 and playwright-full-test-suite have each been picked twice (4 of 8 runs total) and blocked at data-check both times. The harness correctly gates them but consumes a full run-cycle each time. Both tickets are in tickets/open/ without any data-state classification.
- **Proposal:** Establish a new pattern at patterns/ticket-readiness.md: every ticket added to tickets/open/ must include a `data_state: 1|2A|2B|3` field in front-matter, set by running /data-check at ticket-creation time. Worker skips any ticket where data_state is not 3 (or not present). Tickets stuck at 2A/2B move to tickets/waiting/ with a `blocking: <what's missing>` note.
- **Suggested ticket:** `self-improvement-harness-v1`

### Fix 6. Add awaiting-approval TTL and staleness reporting
- **Category:** skill rule
- **Severity:** LOW
- **Evidence:** Runs f64428257aa78ef9 and e0d4365af326ec08 are in awaiting-approval status with no completion timestamp. Nothing in the system signals when an approval is overdue. SOP CLAUDE.md and AGENTS.md describe approval phrases ('approved', 'not approved') but no mechanism for the harness to learn the answer asynchronously.
- **Proposal:** Add to skills/eagleskill/EAGLESKILL.md: every awaiting-approval row gets a `awaiting_since` timestamp. A new skill /harness-pending lists all awaiting-approval runs sorted by age. Beyond 48h, the runner should flag in /session-open output. Consider a tickets/awaiting-approval/<run_id>.md companion file that Shon can edit with 'approved' or 'not approved' as a file-based approval signal that the worker polls.
- **Suggested ticket:** `self-improvement-harness-v1`

## OPEN QUESTIONS FOR VEERABHADRA

- What component writes the run_id=undefined row? Is it a stub written before run object construction completes, or a parse error in a downstream ingest? Need to trace harness/eagle/eagle-harness.js append path.
- Should the harness self-modification carve-out require an explicit ticket-level opt-in (e.g., `allow_paths: [harness/**]`) or be inferred from ticket name pattern? Explicit opt-in is safer but more friction.
- How does Shon currently signal 'approved' to a run that's awaiting-approval? Is it via re-running /eagle-mode2 or /eagle-mode3 manually, or is there an automated path? The JSONL shows no approval events recorded.
- Should blocked-at-data-check tickets auto-move from tickets/open/ to tickets/blocked/ to reduce worker churn, or stay in open/ for visibility? If they stay in open/, the worker needs a 'do not retry within N hours' debounce.
- Are intelligence/proposed-fixes/ outputs intended to be read by the worker on the next cycle (closed-loop self-improvement), or are they human-review-only? The directory exists per gitStatus but the workflow is undocumented in the SOPs.

## CHALLENGE FOR NEXT SESSION

The harness has produced 8 runs but only 1 has executed Mode 3, and that 1 failed on its own scope guard — the system has not yet proven it can complete a single end-to-end build. Before adding new capabilities (RAG, Playwright, self-improvement), the highest-leverage move is to fix the self-modification carve-out and resume-from-stage gaps so harness-eagle-stage-marker-contract itself can complete. A self-improvement harness analyzing 8 runs of which 7 never reached execution will draw conclusions from gating noise rather than build behavior — risking the wrong fixes being prioritized.

## EVIDENCE INDEX

- harness-runs entries cited: `b18cb4fea3eafbea`, `e588f09769330903`, `d65b537434f90d64`, `f64428257aa78ef9`, `e0d4365af326ec08`, `26b83a2927041c0c`, `6afaf56b57461454`, `undefined`
- SOP files cited: `369-brain/CLAUDE.md`, `369-brain/CODING-CONSTITUTION.md`, `369-brain/AGENTS.md`, `369-brain/HOOKS.md`, `369-brain/THE-DEASSISTS-OS.md`
- ticket files cited: `tickets/open/harness-eagle-stage-marker-contract.md`, `tickets/open/self-improvement-harness-v1.md`, `tickets/open/rag-foundation-v1.md`, `tickets/open/playwright-full-test-suite.md`, `tickets/open/github-actions-ci.md`, `tickets/waiting/harness-worker-ticket-ordering.md`, `tickets/complete/sidebar-restructure.md`
