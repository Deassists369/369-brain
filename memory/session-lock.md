# DeAssists — Session Lock
# Location: 369-brain/memory/session-lock.md
#
# CRITICAL FILE — Do not edit manually.
# Written by session-start and session-end skills only.
# This file controls whether a new session can start.
# If STATUS is OPEN — a session is already running.
# If STATUS is IDLE — safe to start a new session.

---

STATUS: IDLE
OPENED_BY: Claude Code (Opus 4.7) — FORCE_CLEAN override of orphaned lock
OPENED_AT: 2026-05-03T13:47:00+02:00
LAST_CLOSED_BY: Claude Code (Opus 4.7)
LAST_CLOSED_AT: 2026-05-04T01:35:00+02:00
LAST_TASK_COMPLETED: self-improvement-harness-v1 shipped — EAGLE Mode 1/2/3 complete, 4 stages executed, brain commit 5c2d546 pushed to main. First analysis run produced 12 KB report + LEARNING-MIND append + JSONL row. Registry row IN PROGRESS → DONE.
CURRENT_TASK: Review intelligence/proposed-fixes/2026-05-03-self-improvement-run-001.md and decide which proposed fixes (Run 001) to adopt vs explicitly defer before letting Run 002 propose more.

---

## STATE DEFINITIONS

IDLE
  No session currently running.
  Safe to start a new session.
  Written at the end of every session.

OPEN
  A session is currently running.
  Do not start another session.
  If found unexpectedly — session closed without protocol.
  Must resolve before starting new work.

---

## IF YOU FIND STATUS: OPEN UNEXPECTEDLY

This means a session ended without running
the session-end protocol. This happens when:
  — Shon closes laptop without saying "stop for today"
  — Claude Code crashes mid-session
  — AI agent task fails without cleanup
  — Network drops during session

What to do:
  1. Check activity-log.md for last entry
  2. Check session-state.md for last known position
  3. Check git log for any uncommitted changes
  4. Confirm with Shon what actually happened
  5. Type FORCE_CLEAN in Claude Code to reset

Do not start new work until resolved.

---

## FOR AI AGENTS

When an AI agent reads this file:

  STATUS: IDLE
    Agent may proceed.
    Agent writes STATUS: OPEN with its own ID.
    Agent works.
    Agent writes STATUS: IDLE when done.

  STATUS: OPEN
    Agent waits 5 minutes.
    Reads again.
    If still OPEN after 30 minutes:
      Agent stops.
      Sends alert to Shon.
      Does not proceed.

  File missing:
    Treat as OPEN.
    Create file with STATUS: OPEN.
    Alert Shon.
    Wait for FORCE_CLEAN.

---

*This file is part of the DeAssists session integrity system.*
*Designed to prevent concurrent sessions and data corruption.*
*Works for human sessions and AI agent sessions equally.*
