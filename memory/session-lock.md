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
LAST_CLOSED_BY: Claude Code
LAST_CLOSED_AT: 2026-05-01T20:10:00+02:00
LAST_TASK_COMPLETED: Phase 2A Q Intelligence complete
NEXT_TASK: Activity tab polish + Phase 2B Service Catalog
SESSIONS_TODAY: 3

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
