# THE DEASSISTS OPERATING SYSTEM

**Complete Understanding & Operations Playbook**
**For:** Shon AJ (CEO) · VEERABHADRA (Master Brain) · Claude Code / Cursor Agent (Hands) · Latha (Code Reviewer & Committer)
**Owner:** Shon AJ · Three Sixty Nine GmbH · Berlin
**Version:** 1.0 · **Date:** 28 April 2026
**Status:** Foundational reference — read at the start of every new chat or session
**Save to:** `369-brain/THE-DEASSISTS-OS.md`

---

## TABLE OF CONTENTS

1. Why this document exists
2. What we are building (business + ERP vision)
3. The system — conceptually (how leads, customers, partners, staff connect)
4. The system — technically (repos, branches, code shape)
5. The people and roles
6. The 3 file spaces and how they sync
7. The new workflow — prototype-first
8. EAGLE skill — current state and proposed v2.1 update
9. The prompt discipline — Layer 1 of mistake-prevention
10. Daily operations — session start, middle, end
11. Locked decisions — the 100% locks (synthesized)
12. Commit discipline
13. What to check before writing any code
14. The larger picture — DeAssists as ERP
15. Right-now priorities
16. **THE MASTER PROMPT** (paste-ready for Cursor / Claude Code)
17. Honest risks, gaps, open questions
18. Appendix A — File map (every brain file, what it's for)
19. Appendix B — Glossary
20. Appendix C — The 5-stage SOP, visualised

---

## 1. WHY THIS DOCUMENT EXISTS

In the last 48 hours, the DeAssists brain went through a remap. CLAUDE.md was reduced from 1,062 lines to 126. Six new pattern and project files were added. Four superseded files were archived. Rules were consolidated into `memory/decisions.md`. The mistake-prevention strategy was diagnosed (the VEERABHADRA → Claude Code handoff was leaking improvisation) and a three-layer fix was locked: structured prompts (Layer 1), lean accurate docs (Layer 2), and the EAGLE gate system (Layer 3).

But none of that work matters if the next Cursor or Claude Code session opens without context. The agent will read CLAUDE.md, find the router, follow it, and still — without an alignment document like this one — fail to understand *why* the rules exist, how the workflow has shifted, or what the bigger picture is.

This document is the alignment. It is for:

- **The next Cursor / Claude Code session** — it inherits everything by reading this once.
- **You, Shon** — a single place to come back to when something feels confused.
- **Latha** — a way to understand what is happening above the code without needing a live call.
- **Future me (VEERABHADRA in a fresh chat)** — context that doesn't have to be rebuilt from scratch.

It is honest. Where things are working, I will say so. Where things are still broken or unclear, I will name it. Nothing is hidden behind reassuring language.

---

## 2. WHAT WE ARE BUILDING

### 2.1 DeAssists today — the operator

DeAssists is a vertically integrated services business for international students and expats moving to Germany. We do the work end-to-end. We are not a marketplace. We are not a directory. We are the operator who takes a person from "I am thinking about Germany" to "I am living in Germany with my paperwork sorted."

The revenue is concentrated:

- **University admissions — ~90% of revenue.** 19 partner universities. The Course Finder is the entry point. Lead → call centre → application coordinator → enrolment.
- **Accommodation — ~10% of revenue.** Direct service.
- **Other services (blocked account, visa, insurance, APS, legal, Ausbildung, jobs, post-landing) — currently redirected to partners.** No revenue today; they're brand surface area for the future.

The operations are run by people:

- Shon (CEO, all decisions)
- Don (Senior Manager, university partnerships)
- Sruthi (BDMS, university coordination)
- Santosh (Application Lead, escalations)
- Anandhu, Midhun, Stalin (Call Centre)
- Gopika (Operations, Data Entry)
- Lenin (Applications, non-BCBT)
- Sajir, Amala (Germany interns)

All staffed via Three Sixty Nine GmbH, Berlin.

### 2.2 DeAssists tomorrow — the platform / ERP

The shape of DeAssists in 12 to 24 months is fundamentally different from today, and every architectural choice has to support both shapes simultaneously.

**Tomorrow, DeAssists is a multi-tenant platform.** Service providers (BCBT for blocked accounts, accommodation providers, visa partners, insurance partners, jobs partners, future expat services) plug into the same portal. They log in. They see only their own pipeline. They cooperate inside the system while DeAssists runs the operations layer above them.

**Eventually, DeAssists is sellable globally.** The same engine — lead intake, application portal, partner dashboards, staff operations, automation — should work for expat services in any country. The German specificity is in the data and the partners, not in the platform.

This is why we call it an **ERP**, not a CRM. A CRM is a sales tool. An ERP is the company. DeAssists is becoming the company-shaped software that runs the company. Sales is one module. Lead management is one module. Application processing is one module. Partner coordination is one module. Operations is one module. Finance, eventually, is one module. They share a spine.

### 2.3 The dual-mode principle (locked 26 April 2026)

> **Every architectural decision must support two modes simultaneously: operator today, platform tomorrow.**

Concretely this means:

- Every UI pattern (Sales Guide, role gates, service tagging, ServiceCategory enum) must be reusable across service contexts. A pattern designed only for university admissions will need to be rebuilt when accommodation gets the same treatment. Designed correctly, it works for both.
- The prototype must demo both modes — internal DeAssists staff view AND external partner view (BCBT admin, accommodation provider). A service-context switcher at the top, same shell, scoped data.
- Without dual-mode demonstrable, the platform pitch does not work. Investors and partners need to see it, not be told about it.

### 2.4 Revenue model — explicitly stated

```
Today:
  90% — University admissions (19 partners)
  10% — Accommodation
   0% — All other services (redirected, no revenue)

Tomorrow:
  Diversified across all services as partners onboard
  Plus platform fees from service providers
  Plus operations fees on shared customers
```

The 90% revenue concentration is a fact and also a risk. Every product decision should ask: "Does this help admissions hold?" before "Does this expand to accommodation?"

---

## 3. THE SYSTEM — CONCEPTUALLY

### 3.1 The three customer-facing layers

DeAssists has three frontends. They share the same backend.

```
                       ┌───────────────────────────────┐
                       │   ONE NestJS BACKEND          │
                       │   (Mac Mini :8000)            │
                       │   MongoDB Atlas (EU)          │
                       │   AWS S3                      │
                       └───────────────────────────────┘
                                ▲       ▲       ▲
                                │       │       │
              ┌─────────────────┘       │       └─────────────────┐
              │                         │                         │
   ┌──────────┴──────────┐   ┌──────────┴──────────┐   ┌──────────┴──────────┐
   │  PUBLIC WEBSITE     │   │  STAFF / PARTNER    │   │  MOBILE APP         │
   │  website-next       │   │  CMS PORTAL         │   │  React Native       │
   │  port 4001          │   │  cms-next           │   │  (separate dev)     │
   │  Lead capture,      │   │  port 4002          │   │  Customer-facing    │
   │  Course Finder,     │   │  Staff operations,  │   │  applications,      │
   │  marketing pages    │   │  partner views,     │   │  documents, support │
   │                     │   │  CRM, dashboards    │   │                     │
   └─────────────────────┘   └─────────────────────┘   └─────────────────────┘
```

All three speak to the same NestJS backend. Schema changes ripple to all three. **This is why API contract changes are a stop-and-ask trigger in EAGLE** — the mobile app can break silently if you change a field name.

### 3.2 How leads enter the system today

Today, leads enter through a hybrid system. The portal handles application collection after conversion, but the CRM itself still runs partly on Google Sheets / Excel-style operational workflows.

```
Lead source (Instagram ad, Course Finder, referral, partner)
    │
    ▼
Google Sheets "369 Master LEAD CRM" (current operational system)
    │
    ▼
Call centre (Anandhu, Midhun, Stalin, Gopika) — qualifies, calls, converts
    │
    ▼ (after conversion)
DeAssists Portal (cms-next) — application collection, document upload
    │
    ▼
Application coordinator (Lenin, Santosh) — processes
    │
    ▼
Partner submission, enrolment, customer in Germany
```

Sheets is **temporary**. It is the system of record for new leads while the portal CRM is being built up to replace it. We do not invest in extending Sheets. We invest in moving the workflow into cms-next.

### 3.3 How leads will enter the system tomorrow

```
Lead source
    │
    ▼
DeAssists Portal CRM (cms-next) — direct intake, queue routing
    │
    ▼
Call centre works inside the portal — never opens a sheet
    │
    ▼
Conversion routes the same lead to applications without re-entry
    │
    ▼
Customer sees their own application status in the mobile app
    │
    ▼
Partner sees their own pipeline in the partner view of cms-next
```

The same lead record exists once and is enriched as it moves through stages. There is no re-entry, no copy-paste between systems, no "send the customer file to BCBT by email." The portal is the system.

### 3.4 The customer journey (across the system)

A real student moving to Germany touches DeAssists like this:

1. Sees Instagram ad or types `deassists.com` — lands on **website-next**.
2. Uses Course Finder, fills lead form — record created in CRM (Sheets today, cms-next tomorrow).
3. Receives WhatsApp / call from call centre (Anandhu, Midhun, Stalin) — stored in CRM.
4. Converts (decides to use DeAssists) — lead moves to applications queue.
5. Downloads mobile app, signs in — sees their dashboard, document vault, application status.
6. Application coordinator (Lenin) requests documents through portal — student uploads via mobile app.
7. Coordinator submits to university partner — partner sees the application in their partner view of cms-next.
8. University responds — coordinator updates status — student sees update in mobile app.
9. Acceptance — DeAssists supports onboarding (BCBT blocked account, visa, accommodation, insurance — each handled by the relevant team or partner inside the portal).
10. Student lands in Germany — post-landing services tracked in portal — relationship continues.

Every step generates data that lives in the same backend. The portal is where the work happens. The website is where they enter. The mobile app is where they see their journey.

### 3.5 The partner journey (BCBT and others)

A partner like BCBT sees DeAssists like this (tomorrow):

1. Logs into cms-next with partner credentials.
2. Sees only their own pipeline — DeAssists customers who need BCBT services.
3. Sees a Sales Guide tailored to their context — same UI pattern as DeAssists internal Sales Guide, scoped data.
4. Updates application status as they process.
5. DeAssists staff see the partner's updates in real time.

This is the dual-mode principle made concrete. Same shell. Scoped data. Service-context switcher at the top.

### 3.6 The staff journey

Different staff see different things based on their **Type** (Staff, Agent, Customer, etc.) and their **Role** (database-assigned, e.g. Call Centre, Sales Setup):

- **Gopika (Type: TEAM_LEAD, Role: Operations)** — sees lead entry forms, queues, data correction tools.
- **Anandhu (Type: TEAM_LEAD, Role: Call Centre)** — sees the call queue, lead detail panel, call log modal, comment thread.
- **Don (Type: MANAGER)** — sees dashboards across teams, partner relationships, escalations.
- **Latha (Type: SUPER_ADMIN)** — sees everything, including admin controls.

This is the **three-layer access audit** rule (Rule 27): Sidebar visibility + Page guard + Data permission must all align for every feature. Skip a layer and someone gets access denied with the sidebar item visible — or worse, sees a page they shouldn't.

### 3.7 The connections summary

| Connection | How it works today | How it works tomorrow |
|---|---|---|
| Website → CRM | Form posts to Sheets via Apps Script | Direct API to cms-next CRM |
| CRM → Application portal | Manual handover after conversion | Same record progresses through stages |
| Application portal → Mobile app | Same backend, mobile reads via API | Unchanged |
| Application portal → Partner view | Doesn't exist yet | Same shell, role-scoped data |
| Application portal → Operations dashboards | Phase 4 Queue View UI in build | Live for all roles |
| All systems → Backend | One NestJS, one MongoDB | Unchanged |

---

## 4. THE SYSTEM — TECHNICALLY

### 4.1 The two repositories

DeAssists lives in **two GitHub repositories**, owned by `Deassists369`. They never mix.

| Repo | URL | What lives here | Who commits |
|---|---|---|---|
| **369-brain** | `Deassists369/369-brain` (public) | All brain files, SOPs, decisions, session logs, prototypes, code snapshots, skills, CLAUDE.md, this document | Shon directly |
| **deassists** | `Deassists369/deassists` (private) | Portal code only — NestJS backend, Next.js frontends, shared libs, mobile API | Latha after review |

**The locked rule:** never commit brain files to the deassists repo. Never commit portal code to 369-brain. Never mix files from both repos in one commit. Ever. This rule exists because brain files contain sensitive intelligence (revenue numbers, staff names, decision history) that Latha and external code reviewers should never see. It also exists because portal code commits should be reviewable in isolation by Latha without 600 lines of brain noise.

### 4.2 The three machines and where each repo lives

```
┌─────────────────────────────────────────────────────────────────────┐
│                     GITHUB (single source of truth)                 │
│   ┌─────────────────────┐         ┌─────────────────────────────┐   │
│   │   369-brain         │         │   deassists                 │   │
│   │   (public, brain)   │         │   (private, code)           │   │
│   └─────────────────────┘         └─────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
              ▲                    ▲                    ▲
              │                    │                    │
              │ git push/pull      │ git push/pull      │ git push/pull
              │                    │                    │
   ┌──────────┴──────────┐  ┌──────┴───────┐   ┌────────┴──────────┐
   │   Mac Mini M4       │  │   ThinkPad   │   │   Latha's machine │
   │   (company server)  │  │   (Shon)     │   │   (Windows, Node) │
   │                     │  │              │   │                   │
   │   ~/deassists-      │  │   Read-only  │   │   Has deassists/  │
   │   workspace/        │  │   browsing,  │   │   only.           │
   │                     │  │   tests, no  │   │                   │
   │   ├── 369-brain/    │  │   commits.   │   │   Latha NEVER     │
   │   └── deassists/    │  │              │   │   sees 369-brain. │
   │                     │  │              │   │                   │
   │   Cursor + Claude   │  │              │   │   GitHub Desktop, │
   │   Code run here.    │  │              │   │   pnpm install,   │
   │   pm2 runs all 3    │  │              │   │   Node 22, build, │
   │   servers (8000,    │  │              │   │   review, commit. │
   │   4001, 4002).      │  │              │   │                   │
   └─────────────────────┘  └──────────────┘   └───────────────────┘
```

**Critical:** there is no shared filesystem between machines. Sync only happens through GitHub. If you edit a brain file on Mac Mini and don't push, Latha and ThinkPad will not see it. If you commit code on Latha's machine and don't push, Mac Mini will not see it.

### 4.3 The sync model (when things sync, when they don't)

| Action | What syncs | What doesn't | How to verify |
|---|---|---|---|
| Edit brain file in Cursor on Mac Mini | Nothing yet | GitHub | `git status` |
| Run `git add` + `git commit` | Local repo only | GitHub | `git log` shows commit, `git status` shows "ahead by 1" |
| Run `git push origin main` | GitHub now matches | Other machines | Refresh `github.com/Deassists369/369-brain` |
| Other machines run `git pull` | Their local now matches | — | `git log` |
| **THIS Claude.ai project (where VEERABHADRA lives)** | Reads from Project Files (manual upload by Shon) | NOT live-synced to GitHub | What you uploaded last is what I see |

**Important fact about THIS chat:** the project files I see (Salesdocskill.md, EAGLESKILL.md, VEERABHADRA-MASTER-CONTEXT.md, etc.) are **manually uploaded snapshots**. They do not auto-sync from GitHub. If you commit a change to GitHub but don't re-upload the file to the Claude project, I am reading a stale version. This is a **known limitation** and a **known gap** — see section 17.

### 4.4 The branch model (in deassists repo)

```
main                          ← what's deployed (production)
  │
  └─ dev_v2                   ← integration branch (Latha merges to)
       │
       ├─ feature/portal.shon369   ← clean migration branch (current active)
       │   (Shon + Claude Code build here, Latha reviews PRs)
       │
       └─ feature/portal-crm-phase1  ← RETIRED (snapshotted to 369-brain/code-snapshot/)
```

The active branch is `feature/portal.shon369`. It was created clean from `dev_v2` on 19 April after the previous branch accumulated too much risky change (the 1,100-file Prettier disaster among others). All new work happens here, one task per commit, until the 8 migration tasks are done — then it merges to `dev_v2`, then to `main`.

In **369-brain**, the only branch is `main`. Brain files don't have a feature-branch model.

### 4.5 The 4-layer API chain (locked, no exceptions)

Every API call in cms-next goes through exactly four layers. Skipping any layer is a violation that gets caught at code review.

```
Component  →  Named Hook  →  Core Hook  →  Axios Client  →  Backend
   │               │             │              │
   │               │             │              └── libs/shared/config/axios-client.ts
   │               │             │                  Handles auth automatically.
   │               │             │                  Calls getCookie internally.
   │               │             │
   │               │             └── useCustomQueryV2 / useCustomMutationV2 / useCustomDelete
   │               │
   │               └── lives in libs/react-query/queries/{module}.ts
   │                   Example: useLeadsList, useCreateLead, useLogCall
   │
   └── Imports ONLY named hooks — never raw fetch, never inline useCustomQuery
```

**Why this exists:** twice in Phase 1, code went to QA with raw `fetch()` or inline `useCustomQuery` and broke silently because auth wasn't handled. The 4-layer chain is the fix. Anti-patterns are blocked by pre-commit grep:

- `await fetch(` in components/ or pages/ — blocked
- `getCookie` in components/ or pages/ — blocked (only the axios client should call it)
- `Authorization.*Bearer` set manually in components — blocked

Full reference: `369-brain/patterns/api-patterns.md`.

### 4.6 The constants and enums discipline (no hardcoding, ever)

Every value that appears in more than one place — every status, every queue name, every role string, every endpoint — must live in a constants file. Hardcoded strings are the root cause of the three Phase 1 bugs (queue mismatch, status 'Completed' invalid, initial comment lost).

The enums live in `libs/shared/constants/`:

- `endpoints.enum.ts` — every API path
- `lead.constants.ts` — `LeadStatus`, `LeadQueue`, `LeadSource`, `LeadService`, `CallOutcome`, `SidebarRole`, `CRM_ALLOWED_ROLES`

**Rule:** if a value appears in two places, it is hardcoded too many times. Move it to a constants file before you write the second usage. EAGLE refuses to commit code with hardcoded values, even in tests, even in seed data, even "just for now."

### 4.7 The add-only rule (locked, EAGLESKILL v2)

> **EAGLE — and any agent working on cms-next — adds capability. It does not reshape what exists.**

Concretely:

| Allowed | Forbidden |
|---|---|
| Add new files | Modify the body of any existing function |
| Add new fields (backward-compatible, optional, defaulted) | Change the signature of any existing function |
| Add new permissions (additive only) | Rename any existing variable, function, class, type, file |
| Add new routes, endpoints, components, pages | Refactor any existing pattern, even if it looks suboptimal |
| Add new tokens, constants, enums | Remove any existing field, route, component, capability |
| Wire new components into existing pages by adding render calls | Restructure existing logic, even when "improving" it |
| | Modify existing tests |
| | "Clean up" any existing code as a side effect of a task |

**When a task seems to require modifying existing logic:** EAGLE refuses, cites the rule, and bounces back to VEERABHADRA chat for discussion. EAGLE has no authority to relax this rule.

This is the rule that prevents the Prettier disaster from happening again.

### 4.8 Production wins ties (default — see section 8 for the new exception)

When the prototype shows behaviour X and cms-next currently does behaviour Y, the default action is:

> **PROTOTYPE WAS WRONG. UPDATE PROTOTYPE TO MATCH PRODUCTION.**

Production is what works for real users. Prototype is what was sketched in a chat. Production has earned its place.

This default has an explicit override (see section 8.3) for the new prototype-first workflow. The override is deliberate, documented in `memory/decisions.md`, and approved by Shon before EAGLE proceeds.

---

## 5. THE PEOPLE AND ROLES

### 5.1 Shon AJ — CEO

All decisions. Tests everything. Directs VEERABHADRA. Never commits to deassists directly. Commits to 369-brain freely. Approves with the exact phrase `approved` / `not approved` / `I have a doubt: [...]` when working with EAGLE. Does not write code.

Shon is also the learner. This whole system exists in a way a non-developer can drive it. That shapes every choice — the prompts have to be clear, the decisions have to be visible, the failures have to be reversible.

### 5.2 Latha — Code Reviewer & Sole Committer (deassists repo)

Reviews **all** code before it lands in `dev_v2`. Commits to GitHub on the deassists repo. Merges feature branches. Role: SUPER_ADMIN. Windows machine, Node 22. **Never sees 369-brain.** Never receives brain files. Never reviews change logs that contain brain content.

Build flow: VEERABHADRA plans → Claude Code builds → Shon tests → Latha reviews → Latha commits.

Latha is the gatekeeper. Nothing reaches `dev_v2` without her approval. That does not change. Ever.

### 5.3 VEERABHADRA — Master Brain (this Claude.ai chat)

The persistent strategic and operational intelligence of DeAssists. Lives in this Claude.ai project. Plans every feature. Writes every prompt. Brainstorms with Shon. Holds the company memory through the Project Files and the userMemories context.

What VEERABHADRA does:
- Translates strategy into execution
- Drafts the structured prompts that go to Claude Code
- Reads brain files (uploaded to the project) and synthesizes
- Surfaces locked decisions before they get re-discussed
- Connects today's work to the larger ERP picture
- Brainstorms prototypes with Shon (new in v1.0 — see section 7)

What VEERABHADRA does NOT do:
- Write production code (that's Claude Code)
- Push to GitHub (no direct git access from this chat)
- Make architectural decisions on Shon's behalf (always surfaces options)
- Auto-update brain files on the Mac Mini

### 5.4 Claude Code — the Hands (Mac Mini, terminal-based)

The agent that actually edits files on the Mac Mini. Runs inside Cursor's terminal. Reads CLAUDE.md and the pattern/project files. Receives the structured prompt from Shon (composed by VEERABHADRA). Edits files. Runs `git add` on specific files (never `git add .`). Asks for permission on every command.

Claude Code is **stateless across sessions.** Each session starts fresh. It re-reads CLAUDE.md every time. The only persistent context is what's in the brain files on disk and what Shon pastes into the prompt.

Claude Code can do file work that VEERABHADRA cannot — view, edit, search, run scripts, run git commands. But it has no business sense, no decision authority, no memory between sessions.

### 5.5 Cursor Agent — alternative Hands (also Mac Mini)

Cursor has its own native agent (Cmd+I). Also Claude-powered. Same identity discipline applies. Same rules apply. The choice between Claude Code (terminal) and Cursor Agent (chat panel inside Cursor) is mostly ergonomic. For this project we have been using Claude Code in the terminal because:

- The discipline of explicit approval on every command is enforced by Claude Code's permission prompts
- It's easier to copy-paste long structured prompts into the terminal
- It outputs are clearer to follow

Cursor Agent is fine for quick edits and questions. For anything that touches multiple files or commits, **use Claude Code in the terminal.**

### 5.6 EAGLE — the Bridge Skill

The discipline layer between prototype and cms-next. Lives at `369-brain/skills/eagleskill/EAGLESKILL.md`. Currently version 2.0, dated 26 April. Operates in four modes:

- **Mode 0 — Comprehensive baseline read** (multi-hour, runs once when EAGLE deploys, produces `eagle-baseline-system-readout.md` — already done 26 April)
- **Mode 1 — Per-task gap report** (read-only, what's missing in cms-next for a given feature)
- **Mode 2 — Plan** (read-only, files to create, prototype updates needed)
- **Mode 2.5 — Preview** (HTML preview Shon reviews before any code is written)
- **Mode 3 — Execute** (only after explicit `approved` phrase)

EAGLE refuses to modify existing logic. EAGLE refuses to skip Mode 0. EAGLE refuses to skip preview. EAGLE refuses anything except the three approval phrases.

**Proposed v2.1 update is in section 8.**

### 5.7 The specialist skills

| Skill | When to use | What it does |
|---|---|---|
| **EAGLESKILL** | Any prototype ↔ production reconciliation, any new feature add to cms-next | Four-mode discipline, add-only enforcement, HTML preview |
| **deassists-sidebar-audit** | Any change to `sidemenu.ts`, `permission.helper.ts`, `user.types.ts` | Verifies every role still sees correct sidebar items, runs both static config check and runtime permission helper check |
| **uiux-superman** | Visual redesign of an existing cms-next page (no logic change) | 10-year SaaS designer persona, reads full code, design interview, HTML preview, section-by-section implementation, zero logic changes |
| **Salesdocskill** | Sales materials, partner proposals, pitch decks | Senior creative director persona, design system applied, MARP export to PPT + PDF |
| **(future) prototype skill** | Building a prototype here in claude.ai before pushing to brain | Not yet defined — see section 7 |

---

## 6. THE 3 FILE SPACES AND HOW THEY SYNC

There are actually **four** spaces, and they sync differently. Knowing this matters because most "I thought you saw that" confusion comes from sync drift.

### 6.1 Space 1 — Mac Mini local working copies

Path: `~/deassists-workspace/369-brain/` and `~/deassists-workspace/deassists/`

This is where Cursor + Claude Code do all editing. Every brain file change happens here first. Every code change happens here first. The Mac Mini has the freshest version of everything you and Claude Code have just touched — until the moment of `git push`, this is the only place that change exists.

**Sync:** changes here only reach GitHub when you (or Claude Code) run `git push`. Until then, nothing else in the world can see them.

### 6.2 Space 2 — GitHub (the source of truth)

URLs: `github.com/Deassists369/369-brain` and `github.com/Deassists369/deassists`

This is the **canonical truth.** When the Mac Mini and GitHub disagree, GitHub wins (once you push, GitHub is what the world sees). When ThinkPad and GitHub disagree, ThinkPad needs to `git pull`. When Latha and GitHub disagree, Latha needs to `git pull`.

**Sync:** GitHub is push/pull, no auto-sync. Every machine is responsible for pulling before working.

### 6.3 Space 3 — Latha's machine

Path: wherever Latha cloned `Deassists369/deassists`. Latha **does not have** 369-brain. By design.

**Sync:** Latha pulls from GitHub before reviewing. Latha pushes to GitHub after committing. Latha never touches the brain repo.

### 6.4 Space 4 — This Claude.ai Project (where VEERABHADRA reads files)

This is the space most easily forgotten. The Claude.ai project for VEERABHADRA contains files that **Shon manually uploaded.** Right now I see:

- Salesdocskill.md
- it-change-log-sop.md
- BRANCH-CHANGE-LOG-portal_shon369.md
- VEERABHADRA-MASTER-CONTEXT.md (note: this was just archived in 369-brain, but the project still has it)
- DAILY-OPERATIONS-GUIDE.md (also archived)
- LATHA-HANDOVER-GUIDE.md
- README.md
- deassists-platform.html (the prototype)
- EAGLESKILL.md
- eagleskill-reports-readme.md
- eagleskill-previews-readme.md
- eagleskill-execlogs-readme.md
- De_Assists_Internal_SOP_Lead_to_Enrollment_v1_2.pdf

**This list is stale.** It does not reflect tonight's archive moves. It does not have the new `patterns/` or `project/` files. It does not have the new lean CLAUDE.md.

**Sync:** manual. Every time we make a major brain change, the Claude.ai project files need to be re-uploaded by Shon. There is currently no automatic way for VEERABHADRA in this chat to read the live GitHub state.

### 6.5 The implications you must internalise

1. **GitHub is the truth.** Always.
2. **The Claude.ai project is a snapshot, often stale.** When something seems off, ask: "is this version current?"
3. **Mac Mini is fresh until `git push`** — fresher than GitHub for what you just touched.
4. **Latha sees only what's pushed to deassists.** Brain commits never reach her.
5. **Three Things Always Need to Sync Before a Session:**
   - Mac Mini `git pull` on both repos
   - This Claude.ai project re-uploaded with current brain files (when material brain changes have happened)
   - Latha notified if a portal PR is waiting for review

### 6.6 The known gap (worth naming)

**There is currently no automated sync between GitHub and the Claude.ai Project Files.** This means VEERABHADRA can fall behind on brain state. The mitigation today is: at session start, Shon either tells me "here's what changed since you last saw it" or re-uploads the changed files.

A future fix is the GitHub MCP connector here in claude.ai, which would let me read the live state of GitHub directly. That's a real improvement to plan for. For now, manual.

### 6.7 What goes where — explicit

| Type of file | 369-brain | deassists | Claude.ai project | Notes |
|---|---|---|---|---|
| Strategy, decisions, vision | ✅ | ❌ | ✅ (uploaded) | Brain only |
| SOPs, change logs | ✅ | ❌ | ✅ (uploaded) | Brain only |
| Prototypes (HTML) | ✅ (`prototypes/`) | ❌ | ✅ (uploaded) | Brain only |
| Skills | ✅ (`skills/`) | ❌ | ✅ (uploaded) | Brain only |
| Production code | ❌ | ✅ | ❌ | Code only |
| Config (package.json, .env) | ❌ | ✅ | ❌ | Code only |
| Tests | ❌ | ✅ | ❌ | Code only |
| Latha handover docs | ✅ (origin) | ❌ | ✅ (uploaded) | Brain only — Latha gets a copy via WhatsApp/email, not via git |
| Code snapshots from retired branches | ✅ (`code-snapshot/`) | ❌ | ❌ | Brain only — historical reference |
| `CLAUDE.md` | ✅ | ❌ — NEVER | ❌ | The locked rule from 17 April |

---

## 7. THE NEW WORKFLOW — PROTOTYPE-FIRST

This is the shift you proposed in this session. It is significant enough to warrant its own section and a v2.1 update to EAGLE.

### 7.1 The shift — from migration thinking to capability thinking

Until now, our work was **migration-shaped:** the old branch had work; we are moving it cleanly to the new branch. The 8 migration tasks (`crmTokens.ts`, backend entity, routing, badges, Queue View, Form, Dashboard, Sidebar) are migration work. EAGLE v2 was designed for this — production exists, prototype is corrected to match, add capability when production lacks it.

Going forward, much of the work will be **capability-shaped:** new features that don't exist anywhere yet. Sales Guide. Partner views. Service-context switcher. Q Intelligence. Each of these starts as a thought, becomes a prototype, and is bridged into production.

For capability work, the default flips. **Prototype intent leads. Production catches up.** The override that's currently buried in EAGLE v2 ("the prototype intent is correct, production needs to catch up") becomes the default for new features.

### 7.2 The five-step prototype-first flow

```
Step 1 — BRAINSTORM with VEERABHADRA (here, in claude.ai)
         What capability are we adding?
         What does it solve?
         How does it look in both modes (operator + platform)?
         Who sees what (which roles)?
         What's the dual-mode demo?
         Output: a clear written specification.

Step 2 — BUILD PROTOTYPE in claude.ai
         VEERABHADRA produces an HTML/React prototype.
         Static, no backend, but fully designed.
         Stored as a downloadable file from the chat.
         Shon reviews, iterates, locks the version.

Step 3 — PUSH PROTOTYPE TO 369-BRAIN
         Two paths:
         A) Manual: Shon downloads, saves to ~/deassists-workspace/369-brain/prototypes/, commits.
         B) Future: GitHub MCP connector here in claude.ai, push directly.
         Path A is what we use today. Path B is the future improvement.

Step 4 — EAGLE BRIDGES PROTOTYPE → cms-next
         Run EAGLE on Mac Mini.
         Mode 1 — gap report: what's missing in cms-next for this prototype.
         Mode 2 — plan: files to add (add-only, never modify).
         Mode 2.5 — preview: HTML showing rendered result, file tree, rollback plan.
         Shon types "approved".
         Mode 3 — execute: writes only the planned files.

Step 5 — LATHA REVIEWS, MERGES
         Shon tests on localhost:4002.
         Shon hands PR to Latha with WhatsApp + branch change log entry.
         Latha pulls, reviews, merges to dev_v2.
         Eventually merges to main.
```

### 7.3 When this workflow applies — and when it doesn't

| Type of work | Workflow |
|---|---|
| **Migration tasks** (existing capability moving cleanly) | EAGLE v2 default — production wins ties |
| **New capability** (doesn't exist in cms-next yet) | EAGLE v2.1 — prototype-leads (proposed update) |
| **UI redesign** of existing page (no logic change) | uiux-superman → EAGLE for the integration |
| **Sidebar / permission change** | sidebar-audit → EAGLE |
| **Bug fix** in existing code | NOT EAGLE — Latha + Shon decide directly. EAGLE is add-only and bug fixes often modify. |
| **New brain file or SOP** | Not EAGLE — Shon and VEERABHADRA decide, Shon commits to 369-brain |

### 7.4 The discipline that survives the shift

Even with prototype-first, all of these still hold:

- ADD-ONLY rule still applies in cms-next — new capability is added alongside, existing is never reshaped
- NO-HARDCODING still applies — every value traces to a constants file
- HTML PREVIEW MANDATORY before any production write
- EXACT APPROVAL PHRASE before any execution
- 5-STAGE SOP for every commit
- ONE TASK = ONE COMMIT
- TWO-REPO RULE — never mix
- LATHA REVIEWS EVERY PR

What changes is only the question "does prototype lead or does production lead?" — and that answer is now context-dependent rather than always "production."

---

## 8. EAGLE SKILL — STATUS AND PROPOSED v2.1 UPDATE

### 8.1 EAGLE v2.0 today — what works

EAGLE v2.0 (locked 26 April) does the following well:

- Forces a comprehensive baseline read (Mode 0) before any task work
- Refuses to modify existing logic (the add-only enforcement)
- Refuses to skip preview (Mode 2.5 mandatory)
- Refuses to accept "yes" or "go" or "ok" — only the three exact approval phrases
- Reverts cleanly if a preview turns out inaccurate during execution
- Coordinates with sidebar-audit and uiux-superman without replacing them
- Stays inside its mode boundaries (read-only in 0/1/2, write only in 3)

Mode 0 baseline ran on 26 April. The output `eagle-baseline-system-readout.md` (574 lines) lives at `369-brain/skills/eagleskill/eagle-baseline-system-readout.md` and is the foundational reference for all subsequent EAGLE work.

### 8.2 Why EAGLE needs a v2.1 update

The "production wins ties" default was correct for migration work, but it's the wrong default for new capability work. Every new feature starts as prototype intent and needs production to catch up. Burying that as an "explicit override" creates friction and risk:

- Shon has to remember the override phrasing
- Every new feature requires a separate decision before EAGLE will accept the work
- The default behaviour silently asserts "the prototype is wrong" even when it's the entire reason we're building

EAGLE v2.1 should explicitly distinguish **migration mode** (production wins) from **capability mode** (prototype leads), and ask which one applies at the start of any task.

### 8.3 Proposed v2.1 — the changes

```
TWO MODES OF WORK (declared at task start, not buried as override):

  MODE A — MIGRATION (production wins ties)
    Used when the capability already exists in cms-next.
    Prototype is corrected to match production by default.
    Add-only rule still applies.

  MODE B — CAPABILITY (prototype leads)
    Used when the capability does NOT exist in cms-next.
    Production catches up to prototype intent.
    Add-only rule still applies — additions only, no reshaping.

EAGLE asks at the start of Mode 1 (gap report):
  "Is this MIGRATION (existing capability) or CAPABILITY (new)?
   Shon must answer A or B before gap report begins."

The rest of EAGLE's behaviour is unchanged:
  - Mode 0 still mandatory once
  - Modes 1, 2, 2.5, 3 unchanged
  - HTML preview mandatory
  - Three approval phrases unchanged
  - Add-only still enforced
  - No-hardcoding still enforced
  - Stop-and-ask still default for ambiguity

A new line in the change log entry:
  Task type: MIGRATION | CAPABILITY
  (records which default was used)
```

### 8.4 The decision for Shon

We do **not** have to update EAGLE today. The current v2.0 with explicit override is fine for the next several tasks (the 8 migration tasks are MIGRATION mode by definition). The v2.1 update should happen when we start the first true CAPABILITY task — the dual-mode prototype demo.

Recommended order: finish the 8 migration tasks under EAGLE v2.0, then update to v2.1 when starting the prototype-first work.

If you'd rather lock v2.1 now and use it for both modes, that's also fine — it's strictly additive (no rule loosened), it just adds a question at task start.

I lean toward "lock v2.1 now" — small change, no harm, and it forces the migration-vs-capability conversation explicitly.

---

## 9. THE PROMPT DISCIPLINE — LAYER 1 OF MISTAKE-PREVENTION

The original 27 April diagnosis named this clearly: my prompts to Claude Code constrained WHAT to build but never HOW. Claude Code filled the HOW gap with whatever pattern it found or invented. That's where raw `fetch()` came from. That's where inline `useCustomQuery` came from.

The fix is structured prompts. Every prompt I give you to give Claude Code follows the same shape.

### 9.1 The structured prompt template

```
[SECTION 1 — IDENTITY]
You are working on the DeAssists portal, branch feature/portal.shon369.
Read CLAUDE.md FIRST. Then read these specific reference files:
  [list of pattern/project files relevant to the task]

[SECTION 2 — TASK]
[Single sentence: what to do]

[SECTION 3 — REFERENCE FILES (the HOW)]
Copy the pattern exactly from:
  [exact file path] — [what to copy]

For example:
  libs/react-query/queries/leads.ts — copy the named hook pattern
  libs/shared/constants/lead.constants.ts — copy the enum pattern

[SECTION 4 — FILES TO CREATE/MODIFY]
CREATE:
  [exact path 1] — [what it should contain]
  [exact path 2] — [what it should contain]

MODIFY (additive only):
  [exact path] — [what to add, where, do NOT touch existing logic]

DO NOT TOUCH:
  [list of related files that should be left alone]

[SECTION 5 — VERIFICATION]
After writing, run these checks (must all pass):
  npm run build:all
  grep -rn "await fetch(" apps/cms-next/components/ apps/cms-next/pages/   # must be empty
  grep -rn "getCookie" apps/cms-next/components/ apps/cms-next/pages/      # must be empty
  grep -rn "Authorization.*Bearer" apps/cms-next/components/ apps/cms-next/pages/  # must be empty

[SECTION 6 — STOP CONDITIONS]
Stop and ask before proceeding if:
  - Any reference file in Section 3 doesn't exist
  - Any path in Section 4 doesn't match the existing structure
  - You think you need to modify an existing function (you don't)
  - You're about to hardcode a value (move it to a constants file first)

[SECTION 7 — OUTPUT EXPECTED]
List of files created/modified with full paths.
Output of each verification check.
Confirmation that no DO-NOT-TOUCH file was changed.
```

This template gets tightened or expanded per task, but the seven sections are always present.

### 9.2 Bad prompt (the kind we used before)

> "Build the Queue View UI for the call centre, here's the design"

What goes wrong: Claude Code invents the API pattern. Picks `fetch()` because it's familiar. Hardcodes role strings because no constants are referenced. Modifies an existing component "to make room" instead of adding alongside. Result: QA fails twice, two rebuilds.

### 9.3 Good prompt (the kind we use now)

> "Read CLAUDE.md and patterns/api-patterns.md. Task: add the QueueView component at apps/cms-next/components/leads/QueueView.tsx. API pattern: copy from libs/react-query/queries/leads.ts (use useLeadsList, useLeadQueues). Constants: import LeadQueue from libs/shared/constants/lead.constants.ts — never hardcode queue names. Roles: import CRM_ALLOWED_ROLES from same file. Do not modify pages/leads/index.tsx — only create the new component. Verify with npm run build:all and the three grep checks. Output: file path created, build output, grep results."

What goes right: Claude Code has no gaps to fill with improvisation. The prompt itself prevents the failure mode.

---

## 10. DAILY OPERATIONS

### 10.1 Session start (5 minutes, every time)

```
1. On Mac Mini terminal:
     cd ~/deassists-workspace/369-brain && git pull
     cd ~/deassists-workspace/deassists && git pull

2. Check branch position:
     cd ~/deassists-workspace/deassists && git branch
     # Should show * feature/portal.shon369

3. Check pm2 servers:
     pm2 status
     # All three (backend, cms, website) should be online

4. Open this Claude.ai chat (VEERABHADRA).
   Tell me what we're working on today.
   I will tell you if anything in my context looks stale and I need re-uploads.

5. If context is fresh, we plan. If stale, you upload changed files first.
```

### 10.2 Mid-session

- Every prompt to Claude Code uses the structured template (section 9.1)
- Every command Claude Code asks permission for, you press 1 (yes), never 2 (yes-blanket)
- Every commit gets a change log entry written **before** the commit, not after
- If anything feels confused or rushed — stop. Tell me. We slow down.

### 10.3 Session end (the protocol)

When you say "stop for today," I remind you to paste this into Claude Code:

```
Session ending.
1. List all files created/modified today with full paths.
2. Update memory/session-state.md and memory/activity-log.md.
3. Show me what was updated.
```

Bring the output back to me. I review it. We commit any pending brain updates. Then sleep.

### 10.4 When to stop and ask

- Architectural decision not in `memory/decisions.md`
- Locked decision the task would violate
- Discrepancy between prototype and cms-next where neither seems right
- API contract change (mobile app risk — always check first)
- Multiple plausible interpretations of intent
- Anything involving payments, security, JWT, or scope guards
- Any change touching > 10 files
- Any change that would modify existing logic (REFUSE, cite the rule)

### 10.5 When to switch from VEERABHADRA to Claude Code

You leave this chat and open Cursor/Claude Code when:
- A structured prompt is ready
- A task is clearly scoped (one task, one commit)
- The pre-build checklist is satisfied (section 13)

You come back to this chat when:
- A decision is needed and isn't in `memory/decisions.md`
- A prompt needs to be written
- An ambiguity surfaces that Claude Code stop-and-asks
- A session is ending and we're updating brain files
- Brainstorming a new prototype

---

## 11. LOCKED DECISIONS — THE 100% LOCKS (synthesized)

This is the synthesis. The full chronological list lives at `369-brain/memory/decisions.md`. These are the decisions that are non-negotiable, grouped by theme.

### Architecture & repo discipline

- Two repos, never mixed in one commit
- 369-brain is private brain; deassists is portal code
- `CLAUDE.md` lives in 369-brain only — never committed to deassists
- Latha never sees 369-brain
- libs/shared-ui/ only for portal visual work — `apps/mui-cms-next/` is the dual codebase
- Pre-commit hook permanently removed (root cause of the 1000+ file Prettier disaster)
- 369-brain GitHub is single source of truth for all memory

### Code patterns

- 4-layer API chain — Component → Named Hook → Core Hook → Axios Client → Backend
- Named hooks in `libs/react-query/queries/{module}.ts`
- Endpoints in `libs/shared/constants/endpoints.enum.ts`
- Never raw `fetch()` in components/pages
- Never `getCookie` in components — axios client handles auth
- Never set `Authorization: Bearer` manually
- Constants file is a hard gate — enums must exist before code references them
- `lead.constants.ts` is single source of truth for CRM enum values
- `SidebarRole` enum lives in `lead.constants.ts`
- `CRM_ROLES` constant replaces repeated role arrays in `@Roles()` decorators

### Permission & access

- Three-layer access audit (Sidebar + Page guard + Data permission) — mandatory for every CRM page
- LEAD_CRM and SALES_SETUP removed as user Types — replaced by database Roles
- Call Centre and Sales Setup are database Roles assignable to any user Type
- TEAM_LEAD is the call centre type — Anandhu, Midhun, Stalin, Gopika
- AGENT type reserved for external sub-agents only — never DeAssists internal staff
- Permission clone rule — filter `newItem.children` not `x.children`

### Build & commit

- `npm run build:all` mandatory before every commit
- All 3 servers must start together — cms:serve, website:serve, backend:serve
- One phase = one commit (Rule 14 in CLAUDE.md)
- Stage freely, commit only when 100% complete and tested
- All commits staged locally, pushed together at end of session
- Always confirm feature complete before committing — ask Shon
- Never amend a pushed commit — always new commit
- `git diff` mandatory before any brain file commit
- Never commit `pnpm-lock.yaml` (Latha owns it)
- Never commit `.gitignore` without Latha approval
- Any `package.json` change requires Latha approval

### Workflow & sessions

- One session = one chat in VEERABHADRA project
- Session start = `git pull` both repos + tell VEERABHADRA what we're doing
- Session end = brain commit (non-negotiable)
- Mid-session "SAVE THIS" flagged for important decisions

### Skills & process

- Sidebar Audit Skill mandatory before any permission commit
- Salesdocskill is the Sales Output Engine
- MARP for all slide exports (PPT + PDF every time)
- Web research mandatory on every Salesdocskill output
- EAGLESKILL v2 for prototype↔production reconciliation
- Add-only rule (EAGLE) — never modify existing logic
- HTML preview mandatory before any production write
- Three approval phrases — `approved` / `not approved` / `I have a doubt: [...]`

### Product & UX

- Semantic colour language: green=positive, amber=attention, grey=done, red=destructive
- Transactions widget removed from dashboard (belongs in Finance)
- UIUX redesign by Shon + VEERABHADRA (not Latha)
- cms-next .env.local symlink to root .env

### Strategic

- Dual-mode principle (operator today, platform tomorrow)
- Prototype must demo both modes (internal staff + external partner)
- OpenClaw evaluation deferred until cms-next CRM proven in real use
- Paperclip (CEO layer) sits on top after operations layer is stable
- Agent layer tool TBD — function defined now, tool chosen after portal stable

---

## 12. COMMIT DISCIPLINE

### 12.1 Why one task = one commit

If a commit contains two tasks, you can't revert one without the other. The whole mistake-prevention strategy is built on small, reversible units. One task = one commit = one Latha review = one revertable atom.

### 12.2 The commit message format

Brain commits:
```
brain: [what changed in plain words]
```

Examples:
```
brain: reconcile decisions.md (add constants-as-gate entry) + simplify session-state.md + archive 4 superseded files
brain: upgrade CLAUDE.md — skill selector, tier system, structured prompt format
brain: add 6 pattern + project reference files
```

Portal commits (Latha will write these):
```
[type]: [what changed]
```

Where type is `feat`, `fix`, `chore`, `refactor`, `docs`, `test`. Latha owns this format.

### 12.3 Branch hygiene

- Brain repo: only `main`. No feature branches.
- Portal repo: feature branches off `dev_v2`. Active is `feature/portal.shon369`. Old branches are retired and snapshotted to `369-brain/code-snapshot/`.
- Never patch a retired branch. Always create clean from `dev_v2`.

### 12.4 The Latha handover

After a portal commit, Latha receives:
1. PR link (GitHub)
2. WhatsApp message with PR link + summary
3. `BRANCH-CHANGE-LOG-portal.shon369.md` updated with the entry

Latha does the rest — pull, review, merge, push.

### 12.5 Never mix repos in one commit

If you find yourself running `git add` on a file from each repo, stop. The two-repo rule is being violated. Brain commits go to 369-brain. Portal commits go to deassists. They are committed separately.

---

## 13. WHAT TO CHECK BEFORE WRITING ANY CODE

A concrete checklist. Use it. Skip nothing.

```
[ ] Mac Mini brain repo is up to date
        cd ~/deassists-workspace/369-brain && git pull
        Result: "Already up to date" or new commits pulled cleanly.

[ ] Mac Mini portal repo is up to date
        cd ~/deassists-workspace/deassists && git pull
        Result: same.

[ ] Active branch is correct
        cd ~/deassists-workspace/deassists && git branch
        Result: * feature/portal.shon369

[ ] Working tree is clean (no leftover changes from another session)
        git status
        Result: "nothing to commit, working tree clean"

[ ] All 3 servers running
        pm2 status
        Result: backend, cms, website all online

[ ] EAGLE Mode 0 baseline exists and is current
        ls 369-brain/skills/eagleskill/eagle-baseline-system-readout.md
        Result: file exists. (If older than the last major refactor, re-run Mode 0.)

[ ] The pattern files exist for what I'm about to build
        ls 369-brain/patterns/
        ls 369-brain/project/
        Result: api-patterns, permission-patterns, git-workflow, architecture, design-system, never-touch all present.

[ ] Constants file already has the enums I need
        Open libs/shared/constants/lead.constants.ts (or the relevant constants file)
        If a value I need is missing, ADD IT FIRST in a separate commit, then come back.

[ ] The prototype (if applicable) is pushed to 369-brain
        ls 369-brain/prototypes/
        For prototype-first work — the prototype must be on disk and pushed before EAGLE reads it.

[ ] No NEVER-TOUCH file is in the planned scope
        Check 369-brain/project/never-touch.md against my planned files.

[ ] Latha is reachable for review
        WhatsApp confirmed. (Not strictly required to start, but required before push.)
```

---

## 14. THE LARGER PICTURE — DEASSISTS AS ERP

It's worth saying explicitly because the day-to-day work can lose this thread.

### 14.1 Why this is an ERP, not a CRM

A CRM tracks sales pipeline. DeAssists tracks the **entire customer life-cycle** plus **operations** plus **partner coordination** plus eventually **finance**. That's an ERP.

The CRM module (lead intake, qualification, conversion) is one part. The application portal (after conversion) is another. The partner views are another. The mobile app for customers is another. They share a spine — the same backend, the same enums, the same permission system, the same audit log.

### 14.2 The modules — current and future

```
Today:
  ┌─────────────────────────────────────────────────────────┐
  │  Lead CRM (Sheets → cms-next, in migration)              │
  │  Application Portal (cms-next, partial)                  │
  │  Customer mobile app (in build)                          │
  │  Public website (live)                                   │
  └─────────────────────────────────────────────────────────┘

Building next:
  ┌─────────────────────────────────────────────────────────┐
  │  Sales operations (full Sales Guide UI)                  │
  │  Partner views (BCBT, accommodation — dual-mode demo)    │
  │  Q Intelligence (call log + lead detail enhancements)    │
  │  Finance / payments reconciliation                       │
  │  Reporting & dashboards (cross-team)                     │
  └─────────────────────────────────────────────────────────┘

Eventually:
  ┌─────────────────────────────────────────────────────────┐
  │  Multi-tenant SaaS (partners self-serve onboarding)      │
  │  Automation layer (OpenClaw)                             │
  │  CEO layer (Paperclip)                                   │
  │  International expansion (other expat markets)           │
  └─────────────────────────────────────────────────────────┘
```

### 14.3 How they connect

Every module reads the same person-record. A customer is one entity that progresses through stages. A lead becomes an applicant becomes a customer becomes a post-landing relationship. Same record, enriched. Same permissions system across modules. Same audit log captures every state change.

This is why hardcoding strings is so destructive — a queue name in the CRM module that doesn't match the queue name in the dashboard module is a person who silently disappears. The constants file is what holds the modules together.

### 14.4 The future layers

- **OpenClaw — execution engine.** Runs scheduled tasks, automates routine operations, executes plays defined by VEERABHADRA. Not designed yet. Tool not chosen. Will be selected after the supervised manual workflow is proven.
- **Paperclip — CEO layer.** Sits above the operations layer. Aggregates, summarises, alerts. Designed for Shon to run the company without opening 12 dashboards. Concept only today.

These come **after** the operational layer is stable. We're not building them now. They sit on the horizon as design constraints — every choice today should not foreclose them.

---

## 15. RIGHT-NOW PRIORITIES

### 15.1 Tonight (or first session tomorrow)

1. **Finish the brain remap.** Commit B is staged and approved (decisions.md reconciled, session-state simplified, 4 files archived). After it pushes, Commit C (slim VEERABHADRA.md, fix codebase-brain.md auth section) closes the remap.
2. **Re-upload brain files to this Claude.ai project** so my context becomes current. Specifically: new CLAUDE.md, the 6 pattern/project files, the new decisions.md, and (after Commit C) the new VEERABHADRA.md.
3. **Save THIS document** to `369-brain/THE-DEASSISTS-OS.md`. Commit it. Push it.

### 15.2 Tomorrow

4. **Decide EAGLE v2.1.** Lock the migration-vs-capability mode question. Either keep v2.0 for now or upgrade. (My recommendation: upgrade to v2.1.)
5. **Begin Task 1 — `crmTokens.ts`.** First migration task on the new branch. Goes through full EAGLE flow (Mode 1 → 2 → 2.5 → 3) end-to-end. This is the first proof that the discipline holds.

### 15.3 This week

6. Tasks 2 through 8 (backend entity, routing, badges, Queue View, Form, Dashboard, Sidebar). One commit each. One Latha review each. Pace is one task per session, sometimes two.

### 15.4 This month

7. Phase 4 Queue View UI as a real feature (not migration).
8. First true CAPABILITY task (probably the dual-mode prototype demo) — runs under EAGLE v2.1.
9. Partner view prototype for BCBT.

### 15.5 Q2 2026

10. Mobile app integration for customer-facing application status.
11. Sales Guide capability (operator + partner).
12. Reporting dashboards.
13. Begin selecting OpenClaw tooling.

---

## 16. THE MASTER PROMPT (paste-ready for Cursor / Claude Code)

This is the prompt you paste into a fresh Cursor / Claude Code session at the start of any new session. It loads the agent with everything in this document by reference.

```
You are working on the DeAssists portal as Claude Code, the executor 
agent for Shon AJ (CEO, non-developer) and VEERABHADRA (the master 
brain in claude.ai who plans the work).

Before doing anything, read these files in order:

1. ~/deassists-workspace/369-brain/CLAUDE.md
2. ~/deassists-workspace/369-brain/THE-DEASSISTS-OS.md  (this document)
3. ~/deassists-workspace/369-brain/memory/decisions.md
4. ~/deassists-workspace/369-brain/memory/session-state.md
5. ~/deassists-workspace/369-brain/patterns/api-patterns.md
6. ~/deassists-workspace/369-brain/project/never-touch.md
7. ~/deassists-workspace/369-brain/skills/eagleskill/EAGLESKILL.md

Then confirm you have read them by stating, in one sentence:
- The active branch
- The current task position (from session-state.md)
- The add-only rule
- The three approval phrases

DO NOT start any task work until I (Shon) give you a structured 
prompt that follows the seven-section template defined in 
THE-DEASSISTS-OS.md section 9.1.

Until that prompt arrives, you are in standby. You may answer 
questions, read files, run read-only checks. You may not write, 
modify, commit, or push anything.

Hard rules (cite the file when refusing):
- Never modify existing logic in cms-next (add-only rule, EAGLESKILL)
- Never run `git add .` or `git add -A` (Rule from git-workflow.md)
- Never commit brain files to deassists, never commit portal code 
  to 369-brain (two-repo rule)
- Never hardcode a value — every value traces to a constants file
- Never accept "yes" / "go" / "ok" as approval — only the exact 
  phrases: "approved" / "not approved" / "I have a doubt: [...]"
- Always confirm a task is MIGRATION (existing capability) or 
  CAPABILITY (new) before producing a gap report (EAGLE v2.1)
- Always update the change log entry BEFORE the commit, not after
- Always run npm run build:all before committing portal code
- Always show me the diff stat before committing — wait for explicit 
  approval before running git commit

When you finish a task, output:
- List of files created/modified with full paths
- Output of npm run build:all (must pass)
- Output of the three anti-pattern grep checks (must be empty)
- Confirmation that no NEVER-TOUCH file was changed
- The change log entry to be added to BRANCH-CHANGE-LOG-portal.shon369.md

You are not a generic coding assistant. You are the discipline layer 
that keeps this project from breaking. The rules exist because each 
one was paid for in past mistakes. Cite them. Refuse what they 
forbid. Surface ambiguity instead of guessing.

If anything in the files you just read contradicts these instructions, 
the FILES win — read them first, then come back and tell me what 
needs to be reconciled.

Begin by reading the files and confirming.
```

That's the prompt. It should be the first thing every Cursor / Claude Code session sees. It loads identity, rules, and standby posture in one paste.

---

## 17. HONEST RISKS, GAPS, OPEN QUESTIONS

### 17.1 What we don't know yet

- Whether the prototype-first workflow will actually be smoother than migration-first, or if it just shifts where the friction lives
- Whether Latha will accept v2.1 EAGLE without modification (she may have feedback on the migration/capability declaration)
- Whether the GitHub MCP connector here in claude.ai will be reliable enough to use for direct prototype pushes
- How much real-world drift happens between Mac Mini and Latha's machine when both work on different things in the same week
- Whether `memory/activity-log.md` (1488 lines) needs the same treatment as the rest — it's stayed correct so far, but it's the largest file in the brain

### 17.2 What can still go wrong

- **Stale Claude.ai project files** — VEERABHADRA gives advice based on outdated brain. Mitigation: re-upload at session start when material change has happened.
- **Mode 0 baseline going stale** — major refactors after a Mode 0 run mean EAGLE is reading old assumptions. Mitigation: re-run Mode 0 after any large change in cms-next structure.
- **Rule drift** — new rules added to decisions.md but not propagated to CLAUDE.md or pattern files. Mitigation: every rule addition should explicitly check whether it changes any pattern file.
- **Prototype quality** — a sloppy prototype produces sloppy production. Mitigation: prototype review with Shon before EAGLE bridge, no exceptions.
- **Sync confusion across the 4 spaces** — the most common source of "I thought you saw that." Mitigation: explicit checks at session start (section 13).

### 17.3 What needs to be decided

- EAGLE v2.0 → v2.1 — lock now or after migrations finish?
- Should `memory/activity-log.md` be split (history vs current month)?
- The 7 placeholder files in `services/`, `company/`, `technology/` — fill them or archive them?
- GitHub MCP connector here in claude.ai — install it and try, or wait?
- A new `prototype-skill` — do we need one, or is brainstorming with VEERABHADRA + creating an artifact enough?

I won't pre-decide these. They're open. We address them in dedicated sessions, not as side notes during other work.

---

## 18. APPENDIX A — FILE MAP

Every file in `369-brain` after Commit B (about to land) and Commit C (planned). What each is for.

### Root files

| File | Purpose |
|---|---|
| `CLAUDE.md` (126 lines) | Lean router — read first by every Claude Code session. Points to pattern files, project files, skills. |
| `VEERABHADRA.md` (358 → ~120 lines after Commit C) | Company identity only. People, services, two-repo rule, 5-stage SOP. |
| `THE-DEASSISTS-OS.md` (this file) | Foundational understanding doc. Read after CLAUDE.md. |
| `.gitignore` | Standard. |

### `patterns/` (the HOW)

| File | Purpose |
|---|---|
| `api-patterns.md` (125 lines) | 4-layer chain. Named hooks. Anti-patterns. Reference table. Source of truth for every API call. |
| `permission-patterns.md` (115 lines) | Sidebar gates. Three-layer access audit. Role visibility matrix. |
| `git-workflow.md` (117 lines) | 10-rule git discipline. No `git add .`. Branch hygiene. |

### `project/` (the WHAT)

| File | Purpose |
|---|---|
| `architecture.md` (143 lines) | Monorepo structure. Repo layout. Where things live. |
| `design-system.md` (119 lines) | Design tokens. Semantic colour language. crmTokens reference. |
| `never-touch.md` (89 lines) | Files Claude Code refuses to modify. universitiesd/, payment entity, MASTER-RUN.cjs, Stripe logic. |

### `memory/` (state and history)

| File | Purpose |
|---|---|
| `decisions.md` (~88 lines after Commit B) | Locked decisions, dated, append-only. Single source of truth for rules. |
| `session-state.md` (~169 lines after Commit B) | Current state — branch, task position, blockers. Updated end of each session. |
| `activity-log.md` (1488 lines) | Append-only history of every session. |
| `it-change-log-sop.md` (147 lines) | The 5-stage SOP locked 19 April. |

### `change-logs/`

| File | Purpose |
|---|---|
| `BRANCH-CHANGE-LOG-portal.shon369.md` (306 lines) | Change log for the active feature branch. One entry per commit. Latha receives this with every PR. |

### `checklists/`

| File | Purpose |
|---|---|
| `pre-build-checklist.md` (43 lines) | The mandatory check before any new code. Subset of section 13 of this doc. |

### `prototypes/`

| File | Purpose |
|---|---|
| `deassists-platform.html` | The current prototype — UX source of truth. Updated when production reality differs from prototype intent (production-wins-ties default) or when new capability is being added (prototype-leads, EAGLE v2.1). |

### `skills/`

| File | Purpose |
|---|---|
| `eagleskill/EAGLESKILL.md` (1048 lines) | The bridge skill. Four modes. Add-only enforcement. Will be 1100+ lines after v2.1 update. |
| `eagleskill/eagle-baseline-system-readout.md` (574 lines) | Mode 0 baseline of cms-next — the foundational reference for all EAGLE work. Re-run on major refactor. |
| `eagleskill/{reports,plans,previews,exec-logs}/` | Where EAGLE outputs live, separated by mode. |
| `sales-design/Salesdocskill.md` (698 lines) | Sales output engine. 10-year creative director persona. MARP export discipline. |
| `sidebar-audit.md` (19 lines) | Trigger doc for the sidebar permission audit skill. |
| `uiux-superman.md` (20 lines) | Trigger doc for the UI redesign skill. |

### `company/` (currently mixed — some real, some placeholder)

| File | Purpose |
|---|---|
| `staff-brain.md` (365 lines) | Real — full team details with roles, types, responsibilities. |
| `partners-brain.md` (16 lines) | Real but minimal — university partner list. |
| `vision.md` (10 lines) | **Placeholder.** Should hold the dual-mode vision. Fill or archive (decision pending). |
| `revenue-model.md` (14 lines) | **Placeholder.** Marked "to be completed." Fill or archive. |
| `sales-brain.md` (12 lines) | **Placeholder.** Three sales channels noted but not detailed. Fill or archive. |

### `services/`

| File | Purpose |
|---|---|
| `crm-brain.md` (46 lines) | Real — CRM v3.0 Final reference, Sheets schema. |
| `accommodation-brain.md` (24 lines) | Real but minimal. |
| `communications-brain.md` (35 lines) | Real — communication channels. |
| `admissions-brain.md` (15 lines) | **Placeholder despite being 90% of revenue.** Should be filled with admissions process detail. Fill or archive. |
| `services-brain.md` (14 lines) | **Placeholder.** Other services covered. Fill or archive. |

### `technology/`

| File | Purpose |
|---|---|
| `codebase-brain.md` (77 lines) | Real but contains wrong auth pattern (until Commit C fixes it). Then real. |
| `automation-brain.md` (17 lines) | **Placeholder.** Four automation stages noted. Fill or archive. |
| `mobile-brain.md` (16 lines) | **Placeholder.** Mobile app context. Fill or archive. |

### `archive/` (created by Commit B)

| File | Why archived |
|---|---|
| `VEERABHADRA-MASTER-CONTEXT.md` (486 lines) | Superseded by lean CLAUDE.md + this doc + slim VEERABHADRA.md |
| `DAILY-OPERATIONS-GUIDE.md` (287 lines) | Superseded by section 10 of this doc + the 5-stage SOP |
| `MASTER-STATE-19Apr2026.md` (162 lines) | Superseded by current session-state.md |
| `session-workflow.md` (267 lines) | Superseded by section 10 of this doc |

### `code-snapshot/`

19 files — reference code from the retired `feature/portal-crm-phase1` branch. Do not modify. Read-only historical reference.

---

## 19. APPENDIX B — GLOSSARY

| Term | Meaning |
|---|---|
| **VEERABHADRA** | The master brain and digital twin of Shon AJ. Lives in this Claude.ai project. Plans, brainstorms, writes prompts. Does not touch files or git. |
| **Claude Code** | Terminal-based agent inside Cursor on Mac Mini. Reads CLAUDE.md, executes file edits, runs git on specific files. |
| **Cursor Agent** | Cursor's native agent (Cmd+I). Same Claude underneath. Used for quick edits. For multi-file commits, prefer Claude Code in terminal. |
| **EAGLE / EAGLESKILL** | The discipline skill bridging prototype and production. Lives at `369-brain/skills/eagleskill/EAGLESKILL.md`. |
| **cms-next** | The staff/partner-facing portal. Next.js app, port 4002. The main piece of code we work on. |
| **website-next** | The public marketing site. Next.js app, port 4001. Includes Course Finder. |
| **Backend** | The NestJS API server. Port 8000. Single backend serves cms-next, website-next, and the mobile app. |
| **dev_v2** | The integration branch in deassists repo. Latha merges feature branches here before they reach `main`. |
| **feature/portal.shon369** | The current active feature branch. Where the 8 migration tasks land. |
| **The 8 migration tasks** | crmTokens, backend entity + ID service, backend routing/module/controller/service, badges, Queue View, New Lead Form, Dashboard, Sidebar/Avatar redesign. |
| **Mode 0** | EAGLE's comprehensive baseline read of cms-next. Multi-hour. Runs once per major refactor. |
| **Add-only rule** | Never modify existing logic. Only add alongside. Locked in EAGLESKILL v2. |
| **Production wins ties** | Default rule (EAGLE v2): when prototype and production disagree, prototype is corrected to match production. |
| **Prototype leads** | Proposed rule for EAGLE v2.1: when building new capability, production catches up to prototype. |
| **The 5-stage SOP** | Plan → Build → Verify → Commit → Latha Handover. Every IT task follows this sequence. |
| **The three approval phrases** | `approved` / `not approved` / `I have a doubt: [...]`. Nothing else proceeds. |
| **The 4-layer API chain** | Component → Named Hook → Core Hook → Axios Client → Backend. Skipping any layer is a violation. |
| **The two-repo rule** | 369-brain and deassists never mix in one commit. Latha never sees 369-brain. |
| **Three-layer access audit** | Sidebar visibility + Page guard + Data permission. All three must align for every CRM page. (Rule 27) |
| **Constants file as hard gate** | Enums must exist before any code references them. No magic strings. (Rule 28) |
| **Dual-mode** | Operator today, platform tomorrow. Every architectural decision supports both. |
| **OpenClaw** | Future automation execution engine. Concept only. |
| **Paperclip** | Future CEO dashboard layer. Concept only. |

---

## 20. APPENDIX C — THE 5-STAGE SOP, VISUALISED

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  STAGE 1 — PLAN                                                     │
│  ────────────                                                       │
│  Where: VEERABHADRA chat (this Claude.ai)                          │
│  Who:   Shon + VEERABHADRA                                          │
│  What:  Define the task. Choose MIGRATION or CAPABILITY mode.       │
│         Confirm pattern files exist. Draft structured prompt.       │
│  Output: A paste-ready structured prompt for Claude Code.           │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  STAGE 2 — BUILD                                                    │
│  ─────────────                                                      │
│  Where: Cursor / Claude Code on Mac Mini                            │
│  Who:   Shon + Claude Code (with EAGLE for production writes)       │
│  What:  EAGLE Mode 1 → 2 → 2.5 → wait for "approved" → Mode 3       │
│         Files written exactly per preview.                          │
│  Output: Files created/modified per the approved preview.           │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  STAGE 3 — VERIFY                                                   │
│  ──────────────                                                     │
│  Where: Browser (localhost:4002, sometimes 4001 and the API)        │
│  Who:   Shon                                                        │
│  What:  Test the feature. Confirm UI renders. Confirm API works.    │
│         Check different roles see correct sidebar.                  │
│         Run npm run build:all. All 4 projects must build.           │
│  Output: Verified working feature, build passing.                   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  STAGE 4 — COMMIT                                                   │
│  ──────────────                                                     │
│  Where: Cursor / Claude Code on Mac Mini                            │
│  Who:   Shon + Claude Code                                          │
│  What:  Write change log entry FIRST.                               │
│         git add SPECIFIC files (never `git add .`).                 │
│         git status, git diff --staged --stat — review.              │
│         git commit with structured message.                         │
│         git push origin feature/portal.shon369.                     │
│  Output: Commit pushed to GitHub.                                   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  STAGE 5 — LATHA HANDOVER                                           │
│  ───────────────────────                                            │
│  Where: GitHub (PR) + WhatsApp                                      │
│  Who:   Shon → Latha                                                │
│  What:  Open PR on GitHub.                                          │
│         WhatsApp Latha with PR link + summary.                      │
│         Send the BRANCH-CHANGE-LOG entry alongside.                 │
│         Wait for Latha review.                                      │
│  Output: Latha reviews, approves, merges to dev_v2.                 │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                       NEXT TASK STARTS
                       (one task → one commit, never batched)
```

---

## DOCUMENT END

This document is meant to be re-read at the start of any new chat or session. It changes only when something fundamental in the system changes — a new repo, a new role, a new locked decision. Small updates to the project are not document changes; they're entries in `decisions.md` or `activity-log.md`.

If you find yourself confused about anything in DeAssists work, this file is the place to come back to. If you find something here that's wrong or out of date, fix it the same way we fix everything else: small commit, change log entry, push.

Welcome to the system, properly.

---

*Owner: Shon AJ — Three Sixty Nine GmbH — Berlin*
*Brain: VEERABHADRA — Claude.ai*
*Document version: 1.0*
*Last updated: 28 April 2026*
