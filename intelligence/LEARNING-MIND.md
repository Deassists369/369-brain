# DeAssists — Learning Mind
# What the brain learned. How it evolved.
# Owner: Shon AJ | Brain: VEERABHADRA
# Evolves: every session close

---

## PURPOSE

This file captures what VEERABHADRA
learned each session.

Not what was built.
Not what was fixed.
What was UNDERSTOOD more deeply.

Every entry makes the brain smarter.
Every entry means the next session
starts ahead of where this one ended.

---

## LEARNING TEMPLATE

SESSION: [date]
DEEPENED UNDERSTANDING:
  [What do we understand better now?]
WRONG ASSUMPTIONS CORRECTED:
  [What did we believe that was wrong?]
PATTERNS IDENTIFIED:
  [What patterns emerged in how we work?]
OPEN QUESTIONS:
  [What do we not yet understand?]
CHALLENGE FOR NEXT SESSION:
  [What should VEERABHADRA push on next time?]

---

## LEARNING — 1 MAY 2026

SESSION: 1 May 2026 — Full day CRM build

DEEPENED UNDERSTANDING:
  The call center agent workflow is more
  fragile than we thought. Every extra click,
  every unclear label, every missing context —
  multiplied by 50 calls per day per agent
  = massive friction cost.
  The portal must be zero-friction first.
  Features second.

  The Guide Layer is not UX polish.
  It is core product infrastructure.
  A portal that trains itself is worth
  significantly more to a university
  than one that needs training programs.

  Backend field additions are genuinely
  low risk when truly additive.
  We should not let fear of backend changes
  slow frontend feature development.

WRONG ASSUMPTIONS CORRECTED:
  WRONG: useCustomQuery always needs result.data.data
  RIGHT: Depends on endpoint type.
         LIST = result.data.data
         SINGLE = result.data
         Always verify with JAM first.

  WRONG: Tooltips are polish — do later
  RIGHT: Tooltips are infrastructure — do with feature
         A feature without tooltips is not done.

  WRONG: Build fast then audit
  RIGHT: Audit after every build, not at end
         Fast without audit creates rework debt

PATTERNS IDENTIFIED:
  We harden fastest when bugs are painful.
  Every bug today added a permanent rule.
  The constitution grew by 4 rules in one session.
  This is the right pace.

  Cursor agent gets better prompts
  when VEERABHADRA reads the code first.
  Prompts written without reading code
  cause cascading fixes.

OPEN QUESTIONS:
  When does the Activity tab become
  the primary view instead of Details?
  As call history grows — should tabs reorder?

  Is the current sidebar structure right
  for when we have 10+ services?
  Will it scale visually?

CHALLENGE FOR NEXT SESSION:
  Before building Phase 2B Service Catalog —
  ask: "Is a catalog page the right answer?
  Or should services be discoverable
  inline in the lead workflow?"
  Challenge the assumption before building.

---

## LEARNING — 3 MAY 2026 — SELF-IMPROVEMENT RUN 001

SESSION: 3 May 2026 — Self-improvement harness Run 001
DEEPENED UNDERSTANDING:
  The eagle-harness Mode 3 stage execution has a structural conflict between its 'add-only' enforcement guard and the harness's own self-modification needs. Run b18cb4fea3eafbea failed because the patcher legitimately needed to write to harness/__tests__/ and intelligence/harness-runs/output/, but the post-apply guard flagged these as out-of-scope. The carve-out documented in tickets/open/harness-eagle-stage-marker-contract.md (Mode 1 review answer #2) has been agreed but not yet codified in the guard.

  Three of seven runs (rag-foundation-v1, playwright-full-test-suite ×2) blocked at data-check phase, indicating data-readiness classification is correctly gating premature builds — the harness is doing its job preventing State 2A/2B features from skipping straight to Mode 1.

  The harness has produced exactly one corrupted run record (run_id=undefined, feature=?, phases=none) — JSONL ingestion or run initialization has a code path that writes a row before the run object is fully constructed.

  Two runs of harness-eagle-stage-marker-contract were started ~90 min apart (b18cb4fe at 19:34, e0d4365a at 21:11). The second run reset to awaiting-approval at Mode 1, suggesting a re-attempt after the Stage 1 patcher failure rather than a Mode 3 retry — there is no Mode 3-only resume path.

  Five of the eight log entries are for features that never reach Mode 3 (4 blocked at data-check, 1 awaiting Mode 1 approval, 1 awaiting Mode 2). Only one feature — harness-eagle-stage-marker-contract — has been driven through Mode 3, and it failed on its first stage. The harness has minimal Mode 3 production data.

WRONG ASSUMPTIONS CORRECTED:
  Initial assumption that Mode 3 add-only enforcement should apply uniformly to all paths. Reality: harness self-modification tickets need a documented carve-out (per Mode 1 answer #2 in harness-eagle-stage-marker-contract.md). Without codifying this carve-out in the guard, every harness-on-harness ticket will fail Stage 1.

  Initial assumption that ticket priority parsing exists. Reality: harness-worker-ticket-ordering.md (waiting bucket) documents that worker picks tickets in filesystem order, which is non-deterministic on macOS. This means rag-foundation-v1 and playwright-full-test-suite (both legitimately blocked) consume worker cycles before higher-priority tickets like harness-eagle-stage-marker-contract.

  Implicit assumption that the JSONL run log is the source of truth. Reality: one run_id=undefined entry corrupts log parsing and any analytics built on top — the writer doesn't validate run_id presence before append.

  Assumption that 'awaiting-approval' is a terminal state needing human intervention. Reality: there is no documented mechanism in the SOPs for an asynchronous approval signal back to the harness (e.g., file-watcher, webhook, or polling), so awaiting-approval runs will accumulate indefinitely until manually re-triggered.

PATTERNS IDENTIFIED:
  Pattern A — Data-check blocks dominate: 3 of 8 runs (37.5%) terminate at data-check:blocked. This is healthy gating but indicates the feature backlog (rag-foundation-v1, playwright-full-test-suite) was queued without first running /data-check manually, violating CODING-CONSTITUTION.md A16 (verify before building).

  Pattern B — Mode 3 stage failures cluster around scope guards, not code generation. The single Mode 3 failure (b18cb4fea3eafbea) was a guard rejection of legitimate writes, not a patch-generation or apply error. This suggests guard logic — not Claude's diff quality — is the current Mode 3 bottleneck.

  Pattern C — Re-runs of the same feature do not preserve prior phase state. e0d4365af326ec08 (second harness-eagle-stage-marker-contract run) restarted at data-check instead of resuming at Mode 3 Stage 1 retry. Wasted work each time a stage fails.

  Pattern D — Approval-gated features lack visible TTL or staleness markers. f64428257aa78ef9 (self-improvement-harness-v1) and e0d4365af326ec08 sit in awaiting-approval with no completion timestamp; nothing in the JSONL signals whether they're 1 hour old or 1 week old to a future analyzer.

  Pattern E — Tickets in tickets/open/ contain answers for review questions inline (e.g., harness-eagle-stage-marker-contract.md has Mode 1 answers from Shon dated 3 May 2026), but those answers are not yet propagated into harness configuration. There's no mechanism to detect 'ticket has unprocessed approval embedded'.

OPEN QUESTIONS:
  What component writes the run_id=undefined row? Is it a stub written before run object construction completes, or a parse error in a downstream ingest? Need to trace harness/eagle/eagle-harness.js append path.

  Should the harness self-modification carve-out require an explicit ticket-level opt-in (e.g., `allow_paths: [harness/**]`) or be inferred from ticket name pattern? Explicit opt-in is safer but more friction.

  How does Shon currently signal 'approved' to a run that's awaiting-approval? Is it via re-running /eagle-mode2 or /eagle-mode3 manually, or is there an automated path? The JSONL shows no approval events recorded.

  Should blocked-at-data-check tickets auto-move from tickets/open/ to tickets/blocked/ to reduce worker churn, or stay in open/ for visibility? If they stay in open/, the worker needs a 'do not retry within N hours' debounce.

  Are intelligence/proposed-fixes/ outputs intended to be read by the worker on the next cycle (closed-loop self-improvement), or are they human-review-only? The directory exists per gitStatus but the workflow is undocumented in the SOPs.

CHALLENGE FOR NEXT SESSION:
  The harness has produced 8 runs but only 1 has executed Mode 3, and that 1 failed on its own scope guard — the system has not yet proven it can complete a single end-to-end build. Before adding new capabilities (RAG, Playwright, self-improvement), the highest-leverage move is to fix the self-modification carve-out and resume-from-stage gaps so harness-eagle-stage-marker-contract itself can complete. A self-improvement harness analyzing 8 runs of which 7 never reached execution will draw conclusions from gating noise rather than build behavior — risking the wrong fixes being prioritized.

Source: intelligence/proposed-fixes/2026-05-03-self-improvement-run-001.md
