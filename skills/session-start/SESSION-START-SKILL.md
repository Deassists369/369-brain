# DeAssists — Session Start Skill
# Version: 1.1 | Date: 30 April 2026
# Owner: Shon AJ | Brain: VEERABHADRA
# Location: 369-brain/skills/session-start/SESSION-START-SKILL.md
#
# Invoke at the start of EVERY Claude Code session.
# Command: "Run session-start skill"
#
# This skill enforces session integrity.
# No work begins without a clean session lock.
# No session ends without writing the lock clean.

---

## WHAT THIS SKILL DOES

1. Checks session integrity (lock file)
2. Reads all required brain files in order
3. Reports current build position
4. Confirms what to work on next
5. Flags any blockers before work begins
6. Enforces session-end protocol at close

Total time: under 90 seconds.
Replaces: manually remembering context.
Prevents: working from stale or wrong state.

---

## HOW TO INVOKE

Start of session:
  "Run session-start skill"

End of session:
  "Stop for today" or "Session ending"
  Skill runs end protocol automatically.

---

## STEP 0 — SESSION LOCK CHECK (ALWAYS FIRST)

Before reading any other file — check the lock.

Read: ~/deassists-workspace/369-brain/memory/session-lock.md

IF STATUS: IDLE
  Safe to proceed.
  Write STATUS: OPEN to session-lock.md:
    STATUS: OPEN
    OPENED_BY: [who — Shon or agent name]
    OPENED_AT: [current timestamp]
    CURRENT_TASK: [will fill after reading state]
    LAST_HEARTBEAT: [current timestamp]
  Continue to Step 1.

IF STATUS: OPEN
  STOP. Do not proceed.
  Show this warning:

  ══════════════════════════════════════
  WARNING — SESSION ALREADY OPEN
  ══════════════════════════════════════
  A session is currently marked as open.

  Last opened by: [OPENED_BY value]
  Last opened at: [OPENED_AT value]
  Last task: [CURRENT_TASK value]
  Last heartbeat: [LAST_HEARTBEAT value]

  This means either:
    A — Another session is currently running
    B — A previous session did not close properly

  To resolve, type one of:
    FORCE_CLEAN — previous session ended normally,
                  safe to start fresh
    REVIEW      — need to check what happened first

  Do not start work until resolved.
  ══════════════════════════════════════

IF file missing
  Treat as OPEN.
  Create session-lock.md with STATUS: OPEN.
  Show warning above.
  Ask Shon to confirm state.

FOR AI AGENTS:
  If STATUS: OPEN — wait 5 minutes, check again.
  If still OPEN after 30 minutes — stop and alert Shon.
  Never force-start without human confirmation.

---

## STEP 1 — READ TIER 1 FILES (mandatory always)

Read these four files. No exceptions.

  ~/deassists-workspace/369-brain/CLAUDE.md
  ~/deassists-workspace/369-brain/CODING-CONSTITUTION.md
  ~/deassists-workspace/369-brain/memory/session-state.md
  ~/deassists-workspace/369-brain/memory/decisions.md

If any Tier 1 file is missing:
  STOP. Report which file is missing.
  Do not proceed without it.
  Ask Shon to restore the file.

---

## STEP 2 — READ TIER 2 FILES (read per task)

Read before starting any feature work.

  ~/deassists-workspace/369-brain/project/vision.md
  ~/deassists-workspace/369-brain/project/PRD.md
  ~/deassists-workspace/369-brain/project/feature-registry.md

If a Tier 2 file is missing:
  Report it. Flag as MISSING.
  Note what context may be incomplete.
  Proceed with available files.

---

## STEP 3 — READ TIER 3 FILES (read when relevant)

Read only when the task requires them.

  For any API or hook work:
    ~/deassists-workspace/369-brain/patterns/api-patterns.md

  For any permission or sidebar work:
    ~/deassists-workspace/369-brain/patterns/permission-patterns.md

  For any git or commit work:
    ~/deassists-workspace/369-brain/patterns/git-workflow.md

  For any code work (always):
    ~/deassists-workspace/369-brain/patterns/anti-ambiguity.md

  For any new feature using EAGLE:
    ~/deassists-workspace/369-brain/skills/eagleskill/EAGLESKILL.md
    ~/deassists-workspace/369-brain/skills/eagleskill/eagleskill-config.md
    ~/deassists-workspace/369-brain/skills/eagleskill/eagle-baseline-system-readout.md

---

## STEP 4 — SESSION START REPORT

After reading all files output this report.
Do not start any work until report is shown.

══════════════════════════════════════
SESSION START REPORT
Date: [today]
Branch: [current git branch — deassists repo]
Lock status: OPEN (this session)
══════════════════════════════════════

CONTEXT LOADED:
  session-lock.md            IDLE → OPEN  ✅
  CLAUDE.md                  [YES/NO]
  CODING-CONSTITUTION.md     [YES/NO]
  session-state.md           [YES/NO]
  decisions.md               [YES/NO]
  vision.md                  [YES/NO]
  PRD.md                     [YES/NO]
  feature-registry.md        [YES/NO]

CURRENT POSITION:
  Last session: [from session-state]
  Last commit: [from session-state]
  Active branch: feature/portal.shon369

NEXT TASK:
  Feature: [from feature-registry]
  Module: [module name]
  Priority: [priority]
  Depends on: [dependencies]
  Mode: MIGRATION / CAPABILITY / LIVE CHANGE

ACTIVE BLOCKERS:
  [list BLOCKED items from feature-registry]
  [list CRITICAL or HIGH Latha items]

PENDING BRAIN UPDATES:
  [list any brain files needing update]

READY TO BEGIN: YES — awaiting Shon instruction
══════════════════════════════════════

---

## STEP 5 — WAIT FOR INSTRUCTION

After the report — stop completely.
Do not begin any task automatically.
Wait for Shon to confirm the next task.

Shon will say one of:
  "Continue with [task]"
  "Start [task]"
  "Check [something] first"
  "Update [file] first"

Only then begin work.

---

## SESSION-END PROTOCOL
## Triggered by: "stop for today" or "session ending"
## This is mandatory. Every step must complete.

STEP E1 — List all files created or modified today
  Show full paths for every file touched.
  Separate brain files from portal files.

STEP E2 — Update session-state.md
  Current build position.
  Last task completed.
  Next task to start.
  Any new blockers found today.

STEP E3 — Append activity-log.md
  Date and session number.
  What was accomplished.
  Commits made with hashes.
  Decisions locked today.

STEP E3B — CONSTITUTION REVIEW (mandatory)
  Before committing brain files ask:

  1. Did we find any bugs today?
     If YES — add to CODING-CONSTITUTION.md Part E
     Document: what happened, root cause, fix, rule

  2. Did we discover any new patterns?
     If YES — add to CODING-CONSTITUTION.md Part F

  3. Were any rules missing that caused confusion?
     If YES — add to CODING-CONSTITUTION.md Part A

  4. Did any checklist item get skipped?
     If YES — add to Part B or C checklist

  This step is mandatory.
  A session that found a bug and did not
  document it has not truly closed.
  The constitution must grow every session.

STEP E4 — Show Shon what was updated
  Confirm session-state.md changes.
  Confirm activity-log.md entry.
  Wait for Shon to verify.

STEP E5 — Commit brain files
  cd ~/deassists-workspace/369-brain
  git add [specific changed files only]
  git commit -m "brain: session close — [date]"
  git push origin main
  Confirm commit hash.

STEP E6 — WRITE SESSION LOCK (MANDATORY LAST STEP)
  Write to memory/session-lock.md:

  STATUS: IDLE
  LAST_CLOSED_BY: [Shon or agent name]
  LAST_CLOSED_AT: [timestamp]
  LAST_TASK_COMPLETED: [what was done]
  NEXT_TASK: [what comes next]
  SESSIONS_TODAY: [count]

  This step cannot be skipped.
  This step cannot be combined with others.
  Without this — next session cannot start.
  This is the final gate. Always last.

══════════════════════════════════════
SESSION CLOSED CLEANLY
Lock: IDLE
Next task: [next task]
See you next session.
══════════════════════════════════════

---

## IF SESSION ENDS UNEXPECTEDLY

If Claude Code crashes, network drops,
or Shon closes without session-end:

  session-lock.md stays as STATUS: OPEN

Next session will find OPEN and raise warning.
Shon reviews what happened.
Types FORCE_CLEAN to reset.
New session starts cleanly.

This is the safety net.
Nothing is lost. Everything is recoverable.

---

## QUICK REFERENCE — TWO-REPO RULE

369-brain repo:
  ~/deassists-workspace/369-brain/
  Brain files, skills, memory, docs.
  Shon commits directly to main.
  No Latha review needed.

deassists portal repo:
  ~/deassists-workspace/deassists/
  Production code only.
  Cursor Agent writes code.
  GitHub Desktop commits.
  Latha reviews every PR.

Never mix files from both repos
in a single commit. Ever.

---

## QUICK REFERENCE — TOOL ROLES

VEERABHADRA (claude.ai)
  Thinks, plans, decides, reviews, approves.
  Drafts all documents.
  Never touches files directly.

Claude Code (Mac Mini — 369-brain connected)
  Reads brain files.
  Saves documents to 369-brain.
  Runs EAGLE modes.
  Commits brain files.
  Runs this session-start skill.

Cursor Agent (Mac Mini — deassists portal)
  Writes production code only.
  Never touches brain files.

GitHub Desktop (Mac Mini)
  Commits portal code changes.
  Shon reviews diff before committing.
  Latha reviews PR before merging.

---

## FOR AI AGENTS — ADDITIONAL RULES

When an AI agent runs this skill:

  Before starting:
    Check session-lock STATUS.
    If OPEN — wait 5 min, check again.
    If still OPEN after 30 min — alert Shon, stop.
    Never force-start without human confirmation.

  During work:
    Update LAST_HEARTBEAT in session-lock
    every 15 minutes.
    This proves the agent is still alive.
    If heartbeat stops — session is considered dead.

  After completing task:
    Always run session-end protocol.
    Always write STATUS: IDLE.
    Always commit brain files.
    An agent that does not close cleanly
    blocks all future sessions.

---

*DeAssists Session Start Skill v1.1*
*Owner: Shon AJ | Brain: VEERABHADRA*
*Created: 30 April 2026*
*Location: 369-brain/skills/session-start/SESSION-START-SKILL.md*
*Invoke: "Run session-start skill"*
*End: "Stop for today" or "Session ending"*
