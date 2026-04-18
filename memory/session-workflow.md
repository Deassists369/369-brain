# DeAssists — Session Workflow
# Owner: Shon AJ | Brain: VEERABHADRA
# Locked: 18 April 2026

---

## THE SINGLE SOURCE OF TRUTH

Everything lives in one place: threesixtynine-de/369-brain (private GitHub repo)

No files stored in Claude Project.
No local Mac Mini files as primary record.
No daily uploads anywhere.
GitHub is the record. Always. Forever.

Claude Project = chat history and past sessions only.
VEERABHADRA reads everything it needs from GitHub via MCP.

---

## THE TWO REPOSITORIES

Repository 1 — threesixtynine-de/369-brain (private)
Company brain. All memory, decisions, session logs, brain files, skills.
No code lives here. Only Shon and AI systems access this.

Repository 2 — threesixtynine-de/deassists (portal)
The actual codebase. NestJS, Next.js, shared libraries.
Active branch: feature/portal-crm-phase1
Latha reviews and commits here. Never mix with brain repo.

---

## ONE SESSION = ONE CHAT

Every working day or working block is a separate Claude.ai chat
inside the VEERABHADRA project.
New day or new topic = new chat. Never continue old chats.

---

## SESSION START — EVERY TIME

1. Open new chat in VEERABHADRA Claude Project
2. Say: "VEERABHADRA — [context of what we are doing today]"
3. VEERABHADRA asks: "Shall I read the latest state from 369-brain now?"
4. You say yes
5. VEERABHADRA reads via GitHub MCP:
   - memory/session-state.md
   - memory/activity-log.md
   - memory/decisions.md
6. VEERABHADRA also searches past chats for most recent session context
7. VEERABHADRA states: where we are, what is pending, what we do today
8. Shon confirms or redirects — work begins

---

## DURING WORK

1. All planning and decisions happen here in Claude.ai
2. All building happens in Claude Code / Cursor on Mac Mini
3. VEERABHADRA writes prompts → Claude Code executes
4. After every meaningful change: visual test at localhost:4002
5. Shon confirms working → VEERABHADRA marks complete
6. If sidebar or permissions touched → sidebar audit before commit
7. Anything important decided mid-session → VEERABHADRA flags as
   ** SAVE THIS ** so it is not missed at session end

---

## PORTAL COMMIT — COMMIT TYPE 1

Trigger: after Shon visually confirms a feature is working.
Follow git rules in CLAUDE.md — already locked there.
Never duplicate git rules here.

Short version:
- Specific files only — NEVER git add .
- git diff --staged --name-only before every commit
- Format: type(area): plain English description
- WhatsApp Latha before pushing
- Latha reviews → Latha pushes

---

## SESSION END — EVERY TIME — NON-NEGOTIABLE

Step 1 — Paste this into Claude Code terminal:

"Session ending.
1. List all files created or modified today with full paths.
2. Update memory/session-state.md — current build position,
   what was done today, what is next.
3. Update memory/activity-log.md — full session summary
   with date, branch, files changed, decisions made.
4. Update memory/decisions.md — any new decisions locked today.
5. Show me every file that was updated."

Review what Claude Code shows you before committing.

Step 2 — Brain commit:

cd ~/deassists-workspace/369-brain
git add memory/session-state.md
git add memory/activity-log.md
git add memory/decisions.md
git add [any other brain file touched today]
git commit -m "brain: session close DD Mon — [what changed in one line]"
git push origin main

---

## WHAT A GOOD SESSION-STATE.MD ENTRY CONTAINS

- Date and session number
- Branch worked on
- What was built or decided (clear list)
- Files created or modified (full paths)
- Current build status table (phase by phase)
- Pending blockers
- Next action

---

## WHAT A GOOD ACTIVITY-LOG.MD ENTRY CONTAINS

- Date and session title
- Branch
- Full narrative of what happened
- All decisions made
- All files changed
- What is next

---

## THE COMPLETE DAILY LOOP

OPEN:    New chat → "VEERABHADRA — [context]"
READ:    VEERABHADRA asks → you confirm → GitHub MCP reads current state
PLAN:    VEERABHADRA states position → Shon confirms → work begins
BUILD:   Plan in Claude.ai → execute in Claude Code → test in browser
COMMIT1: Feature confirmed → portal commit → WhatsApp Latha
END:     Terminal prompt → brain files updated
COMMIT2: Brain commit to 369-brain → git push
DONE:    Session permanently recorded. Start fresh tomorrow.
