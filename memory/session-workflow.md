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
Active branch: feature/portal.shon369
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

---

## WHAT GETS SAVED WHERE — COMPLETE MAP

### FILES THAT LIVE IN 369-BRAIN REPO ONLY

memory/session-state.md        — current build position, updated every session end
memory/activity-log.md         — full session log, updated every session end  
memory/decisions.md            — locked decisions, updated when new decision made
memory/session-workflow.md     — this file, updated when workflow changes
VEERABHADRA.md                 — master identity, updated at milestones
CLAUDE.md                      — codebase rules for Claude Code, updated when rules change

services/crm-brain.md          — updated when CRM knowledge or rules change
services/admissions-brain.md   — updated when admissions knowledge changes
services/accommodation-brain.md — updated when accommodation knowledge changes
services/services-brain.md     — updated when other services knowledge changes
services/communications-brain.md — updated when comms knowledge changes

technology/codebase-brain.md   — updated when tech patterns or decisions change
technology/mobile-brain.md     — updated when mobile decisions change
technology/automation-brain.md — updated when automation decisions change

company/vision.md              — updated when company direction changes
company/revenue-model.md       — updated when revenue knowledge changes
company/sales-brain.md         — updated when sales knowledge changes
company/partners-brain.md      — updated when partner knowledge changes

skills/sidebar-audit.md        — updated when audit skill rules change
skills/uiux-superman.md        — updated when design skill rules change

---

### FILES THAT LIVE IN DEASSISTS PORTAL REPO ONLY

apps/backend-nest/src/**       — all backend NestJS code
apps/cms-next/pages/**         — all portal frontend pages
apps/cms-next/components/**    — all portal frontend components
apps/cms-next/styles/**        — design tokens, CSS
libs/shared/**                 — shared enums, constants, helpers
libs/shared-ui/**              — UI components, sidebar renderer
next.config.js                 — proxy config
Any .ts .tsx .js .json file that runs the portal

---

### THE COMPLETE SAVE MAP — ONE VIEW

| What changed | Repo | Who stages | Who pushes |
|---|---|---|---|
| Portal code (.ts .tsx .js) | deassists | Shon (specific files) | Latha after review |
| CLAUDE.md | 369-brain | Shon | Shon directly |
| VEERABHADRA.md | 369-brain | Shon | Shon directly |
| memory/session-state.md | 369-brain | Shon | Shon directly |
| memory/activity-log.md | 369-brain | Shon | Shon directly |
| memory/decisions.md | 369-brain | Shon | Shon directly |
| memory/session-workflow.md | 369-brain | Shon | Shon directly |
| Any services/*.md | 369-brain | Shon | Shon directly |
| Any technology/*.md | 369-brain | Shon | Shon directly |
| Any company/*.md | 369-brain | Shon | Shon directly |
| Any skills/*.md | 369-brain | Shon | Shon directly |

---

### HOW TO DO THE BRAIN COMMIT WHEN CURSOR IS IN DEASSISTS PORTAL

At session end — even if Cursor is open in deassists portal:

Step 1 — Switch terminal to 369-brain:
cd ~/deassists-workspace/369-brain

Step 2 — Paste session end prompt:
"Session ending.
1. List all files created or modified today with full paths.
2. Update memory/session-state.md — current build position, what was done, what is next.
3. Update memory/activity-log.md — full session summary with date, branch, files, decisions.
4. Update memory/decisions.md — any new decisions locked today.
5. If any service, technology, company or skills brain file changed today — update those too.
6. Show me every file that was updated."

Step 3 — Review every file Claude Code updated.

Step 4 — Stage only what changed:
git add memory/session-state.md
git add memory/activity-log.md
git add memory/decisions.md
git add [any other brain file that changed today]
git diff --staged --name-only
git commit -m "brain: session close DD Mon — [what changed in one line]"
git push origin main

Step 5 — Switch back to portal if needed:
cd ~/deassists

---

### GOLDEN RULES — NEVER BREAK THESE

1. Portal code → deassists repo → Latha reviews before push
2. Everything else → 369-brain repo → Shon pushes directly
3. CLAUDE.md lives in 369-brain only — never in deassists repo
4. Never git add . in either repo — always name specific files
5. Never mix files from both repos in one commit
6. Brain commit happens every single session end — no exceptions
