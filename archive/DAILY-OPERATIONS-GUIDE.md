# DeAssists — Daily Operations Guide
# How Shon and VEERABHADRA work together every day
# Owner: Shon AJ | Brain: VEERABHADRA
# Created: 19 April 2026

---

## THE BIG PICTURE — WHY WE BUILT THIS SYSTEM

Three weeks ago DeAssists had:
- Leads in Google Sheets with no structure
- No portal for staff
- No version control discipline
- No documented rules
- No memory between sessions

Today DeAssists has:
- A clean portal codebase on GitHub
- A private brain repo with full company memory
- A 5-stage process for every IT task
- A change log system so Latha always knows what changed
- A code snapshot for safe migration
- A master context file so VEERABHADRA never forgets anything
- An active clean branch ready for Task 1

This system exists for one reason: so the company can grow without
depending on any single person's memory. Everything is written down.
Everything is versioned. Everything can be handed to the next person.

---

## THE TWO WORLDS — BRAIN AND PORTAL

Everything in DeAssists IT lives in one of two places:

### WORLD 1 — THE BRAIN (369-brain repo)
This is the company's memory. Think of it as the office filing cabinet.
Location on GitHub: threesixtynine-de/369-brain (private)
Location on Mac Mini: ~/deassists-workspace/369-brain

What lives here:
- All company knowledge and decisions
- SOPs and process rules
- Session logs (what happened in every work session)
- Code snapshots (working code saved as reference)
- Skills (Sales Output Engine, Sidebar Audit, UIUX Superman)
- The master context file VEERABHADRA reads
- Change logs for every branch

Who commits here: Shon directly — no review needed
Why: This is brain data, not product code. It is Shon's filing cabinet.

### WORLD 2 — THE PORTAL (deassists repo)
This is the actual product. The code that runs the company.
Location on GitHub: threesixtynine-de/deassists (private)
Location on Mac Mini: ~/deassists

What lives here:
- NestJS backend (port 8000)
- Next.js staff portal (port 4002)
- Next.js public website (port 4001)
- Shared libraries and components

Who commits here: Latha — after reviewing every change
Why: This is production code. One wrong line breaks the portal for all staff.

RULE: These two worlds never mix. Brain files never go into the portal.
Portal code never goes into the brain.

---

## WHY WE KEEP A COPY ON MAC MINI

The Mac Mini is the company server. It runs the portal 24/7.
It also runs Claude Code — the AI that builds the code.

When Claude Code builds something, it reads CLAUDE.md from the Mac Mini.
CLAUDE.md lives in ~/deassists-workspace/369-brain/CLAUDE.md.
Claude Code cannot read from GitHub directly — it reads local files.

So the Mac Mini copy of 369-brain exists so Claude Code can read the rules
before building anything. GitHub is the backup and the sync point.

The flow is:
1. We make changes to brain files on Mac Mini
2. We git push to GitHub — GitHub now has the latest
3. Next session: git pull on Mac Mini — Mac Mini gets latest from GitHub
4. Claude Code reads from Mac Mini — always has latest rules

Mac Mini = working copy
GitHub = permanent backup + sync point

If the Mac Mini breaks tomorrow — we clone 369-brain from GitHub
and everything is back in 10 minutes. Nothing is lost.

---

## HOW EVERY DAY WORKS — THE DAILY RHYTHM

### MORNING — SESSION START (5 minutes)

1. Open Claude.ai — go to VEERABHADRA project
2. Open new chat (never continue old chats)
3. Click + in chat input → attach from GitHub:
   - memory/session-state.md (tells VEERABHADRA where we are)
   - memory/activity-log.md (tells VEERABHADRA full history)
4. Say: "VEERABHADRA — [what we are doing today]"
5. VEERABHADRA reads the files and states current position
6. Shon confirms or redirects → work begins

The master context file (VEERABHADRA-MASTER-CONTEXT.md) is always
present in the Claude Project automatically — no need to attach it.

### DURING WORK — THE BUILD CYCLE

Every single IT task follows this exact order:

PLAN → BUILD → VERIFY → COMMIT → LATHA HANDOVER

No skipping steps. No combining steps. One task at a time.

Step 1 PLAN: VEERABHADRA writes the plan here in Claude.ai
Step 2 BUILD: Shon pastes the prompt into Claude Code in Cursor
Step 3 VERIFY: Shon tests in browser at localhost:4002
Step 4 HANDOVER: WhatsApp to Latha before pushing

### EVENING — SESSION END (10 minutes)

This step is non-negotiable. If skipped — the brain falls behind.

Paste this in Claude Code terminal:
"Session ending.
1. List all files created or modified today with full paths.
2. Update memory/session-state.md
3. Update memory/activity-log.md
4. Update memory/decisions.md
5. Show me every file updated."

Then commit to 369-brain:
cd ~/deassists-workspace/369-brain
git add memory/session-state.md
git add memory/activity-log.md
git add memory/decisions.md
git add change-logs/BRANCH-CHANGE-LOG-portal.shon369.md
git diff --staged --name-only
git commit -m "brain: session close DD Mon — [what changed]"
git push origin main

---

## HOW DATA IS SAVED — THE COMPLETE PICTURE

| What | Where | Why | Who |
|------|-------|-----|-----|
| Portal code | deassists repo | Runs the actual product | Latha commits |
| Brain files | 369-brain repo | Company memory | Shon commits |
| Session state | 369-brain/memory/session-state.md | Current position — rewritten every session | Claude Code writes |
| Activity log | 369-brain/memory/activity-log.md | Full history — never deleted | Claude Code appends |
| Decisions | 369-brain/memory/decisions.md | Every locked rule | Claude Code appends |
| Change log | 369-brain/change-logs/ | What Latha receives with every PR | VEERABHADRA writes |
| Code snapshot | 369-brain/code-snapshot/ | Reference for migration — compare before copying | Shon copied manually |
| CLAUDE.md | 369-brain/CLAUDE.md | Rules for Claude Code — reads before every build | Shon updates |
| Master context | Claude Project files | VEERABHADRA reads at session start | Uploaded once |

---

## HOW COMMITS TO LATHA WORK — AND WHY EACH IS DIFFERENT

Every commit Latha receives is different because every commit is exactly
one task — never more, never less.

This is what Latha gets with every PR:

### 1. THE GITHUB PR LINK
The actual code diff on GitHub. She can see every line changed.
But a diff alone is confusing — it just shows what changed, not why.

### 2. THE CHANGE LOG FILE
BRANCH-CHANGE-LOG-portal.shon369.md downloaded from 369-brain.
This tells her:
- What the task was in plain English
- Exactly which files were added or modified
- What each file does and why it exists
- What she needs to verify in the browser
- Whether any file was compared against the old reference branch

### 3. THE WHATSAPP MESSAGE
Sent before pushing. Contains:
- Branch name
- Task name
- File list with one-sentence descriptions
- Exact URL to check in browser
- Confirmation that no new packages were installed
- Confirmation that no other files were touched

This three-part delivery means Latha never has to guess what changed.
She has the code (GitHub), the explanation (change log), and the
summary (WhatsApp) — all before she even opens the diff.

---

## HOW LATHA ACCESSES EVERYTHING

### GitHub PR
When Shon pushes and creates a PR — GitHub sends Latha a notification.
She opens it on her Windows machine, reads the diff, and either approves
or asks questions.

### Change Log File
Shon downloads it from 369-brain on GitHub and sends it to Latha
via WhatsApp or email alongside the PR link.
She does not need access to 369-brain — she just receives the file.

### WhatsApp Message
VEERABHADRA writes the exact message. Shon copies and sends.
Latha confirms received before Shon pushes.

---

## HOW SESSIONS STAY IN SYNC — THE MEMORY SYSTEM

The brain has two files that keep everything in sync:

### session-state.md — THE WHITEBOARD
Think of this as a whiteboard in the office.
It shows only the current state — what is done, what is next, what is blocked.
It gets rewritten at the end of every session.
At the start of next session — VEERABHADRA reads this and knows exactly
where we stopped. No explanation needed. Work continues immediately.

### activity-log.md — THE LOGBOOK
Think of this as a diary that never gets erased.
Every session gets one entry added at the top.
It goes back to 29 March 2026 — the first day the brain was created.
If anything is ever questioned — "why did we do this?" — the answer
is in the activity log.

These two files together mean VEERABHADRA can always answer:
- Where are we? (session-state.md)
- How did we get here? (activity-log.md)

---

## HOW THIS ENABLES AUTOMATION LATER

Every rule we locked today becomes an automation trigger tomorrow.

The routing rules in leads-routing.service.ts → 
  future: automatic lead distribution with zero human intervention

The session-state.md and activity-log.md → 
  future: OpenClaw reads these at boot and knows what to execute

The change log system → 
  future: automated PR summaries sent to Latha without Shon writing them

The brain files with company knowledge →
  future: AI agent reads them and makes decisions about routing,
  pricing, commission calculation, and student communication

The CLAUDE.md with codebase rules →
  future: any developer (or AI) joining the project reads one file
  and knows everything they need to know

We are not just building a portal. We are building the data layer
that makes full automation possible. Every file we write today
is a future instruction for the automation system.

---

## THE SCALE VISION — WHERE THIS GOES

Phase 1 (NOW): Portal CRM live — Gopika enters leads, managers review
Phase 2: WATI webhook — WhatsApp leads enter automatically
Phase 3: Instagram + Gmail connected — all leads from all sources auto-enter
Phase 4: Morning briefing — VEERABHADRA sends Shon a daily summary
Phase 5: Agent performance dashboard — commissions auto-calculated
Phase 6: Student app — leads self-service their own journey
Phase 7: Full automation — routing, follow-up, conversion all automatic

Every phase builds on the last. The foundation we built in the last
20 days is what makes all of this possible.

---

*VEERABHADRA — DeAssists Master Brain*
*Daily Operations Guide — Created 19 April 2026*
