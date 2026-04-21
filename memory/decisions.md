# DeAssists — Locked Decisions
# Owner: Shon AJ | Brain: VEERABHADRA
# Updated: 18 April 2026

Every locked decision is recorded here with date and reason.
Never delete entries. Only append.

---

## DECISIONS LOCKED

| Date | Decision | Reason |
|------|----------|--------|
| 06 Apr 2026 | CE Codex delegation permanently OFF | Violates Latha review gate |
| 06 Apr 2026 | libs/shared-ui/ only for portal visual work | Two codebases exist — only one is correct |
| 15 Apr 2026 | CLAUDE.md is a living document — update same session any fix is made | Prevents drift and repeated mistakes |
| 15 Apr 2026 | Never amend a pushed commit — always new commit | Git history integrity |
| 15 Apr 2026 | Sidebar Audit Skill mandatory before any permission commit | Prevents silent permission failures |
| 16 Apr 2026 | Transactions widget removed from dashboard — belongs in Finance | Product decision |
| 16 Apr 2026 | Semantic colour language locked: green=positive, amber=attention, grey=done, red=destructive | Design consistency |
| 17 Apr 2026 | CLAUDE.md local only — never commit to deassists repo | Latha must never see it |
| 17 Apr 2026 | Pre-commit hook permanently removed | Root cause of 1000+ file prettier disaster |
| 17 Apr 2026 | pm2 stop cms instead of kill -9 | kill -9 corrupts .next build cache |
| 17 Apr 2026 | Permission clone rule — filter newItem.children not x.children | Sidebar role-switch bug fix |
| 18 Apr 2026 | Agent layer tool TBD — function defined now, tool chosen after portal stable | Prevents premature tool lock-in |
| 18 Apr 2026 | 369-brain is private — only Shon and AI systems | Company intelligence is confidential |
| 18 Apr 2026 | One session = one chat in VEERABHADRA project | Clean separation per unit of work |
| 18 Apr 2026 | 369-brain GitHub = single source of truth for all memory | No local files, no daily uploads, no Claude Project files |
| 18 Apr 2026 | No files stored in Claude Project | GitHub MCP reads on demand — one source eliminates drift |
| 18 Apr 2026 | VEERABHADRA asks to read GitHub at every session start | Ensures always working from live state |
| 18 Apr 2026 | VEERABHADRA flags SAVE THIS mid-session for important decisions | Nothing missed before session end commit |
| 18 Apr 2026 | Git rules live in CLAUDE.md only — never duplicated elsewhere | One place to maintain rules eliminates drift |
| 18 Apr 2026 | Session end brain commit is non-negotiable | Only failure mode is skipping this step |
| 19 Apr 2026 | Session start = attach session-state.md + activity-log.md from GitHub via + button | Replaces GitHub MCP auto-read — more reliable |
| 19 Apr 2026 | Salesdocskill.md is the Sales Output Engine skill | Named and saved to skills/sales-design/ |
| 19 Apr 2026 | MARP for all slide exports — PPT + PDF both every time | Automatable, version controlled, consistent |
| 19 Apr 2026 | Old brochures = content only, never design reference | We elevate — never reproduce |
| 19 Apr 2026 | Web research mandatory on every Salesdocskill output | Stale data in proposals destroys credibility |
| 19 Apr 2026 | Karpathy 4 principles merged into CLAUDE.md | Better AI coding discipline in every session |
| 19 Apr 2026 | Sidebar hook changed to non-blocking reminder only — never blocks commit | Blocking hook caused friction without preventing the real problem (blanket prettier) |
| 19 Apr 2026 | CRM migration done in 3 groups not 7 individual commits — Latha's preference | Cleaner PR review — fewer commits to trace |
| 19 Apr 2026 | All commits staged locally, pushed together at end of session | Reduces risk of partial push; Latha sees complete branch at once |
| 19 Apr 2026 | One commit per phase — Rule 14 locked permanently in CLAUDE.md | 7 commits for one feature is noise — one phase one commit is the permanent standard |
| 19 Apr 2026 | Always confirm feature complete before committing — ask Shon first | Incomplete work committed = wasted Latha review cycles |
| 19 Apr 2026 | Stage freely, commit only when done | git add = staging = safe; git commit = locking = only when 100% complete and tested |
| 21 Apr 2026 | LEAD_CRM and SALES_SETUP removed as user Types — replaced by role-based access | Type-based sidebar access was too coarse; database Roles give finer control without code deploys |
| 21 Apr 2026 | Call Center and Sales Setup will be database Roles assignable to any user Type | Any user Type (Staff, Agent etc) can be a Call Center agent — role assignment, not code change |
| 21 Apr 2026 | SidebarRoles enum to be created in libs/shared/constants/ — no magic strings | Magic role name strings spread across sidemenu.ts and permission.helper.ts will break silently |
| 21 Apr 2026 | lead.constants.ts to be created with LeadStatus, LeadQueue, LeadSource, CallOutcome enums | Three critical bugs traced to mismatched queue/status strings across entity, service, dashboard |
| 21 Apr 2026 | CRM_ROLES constant to replace repeated role arrays across all CRM controller endpoints | Same roles array copy-pasted in every @Roles() decorator — one change point needed |
| 21 Apr 2026 | Code audit score 4.5/10 — 3 critical bugs must be fixed before Phase 2 starts | BUG 1: queue mismatch (all counts = 0), BUG 2: status 'Completed' invalid, BUG 3: initial comment lost |
| 20 Apr 2026 | UIUX redesign done by Shon + VEERABHADRA — not Latha | Latha builds backend, we build UI — cleaner division of labour |
| 20 Apr 2026 | Call Center and Sales Setup needed as database Roles | Enable role-based CRM access without creating new user Types |
| 21 Apr 2026 | Sales Dashboard moves to Call Center 369 children | Agents working in call center need dashboard in same section |
| 21 Apr 2026 | SidebarRole enum in lead.constants.ts — no magic strings | Matches existing enum patterns; magic strings in sidemenu.ts will break silently |
| 21 Apr 2026 | lead.constants.ts enums: LeadStatus, LeadQueue, LeadSource, LeadService, CallOutcome, SidebarRole, CRM_ALLOWED_ROLES | Single source of truth for all CRM string values — eliminates 3 critical bugs caused by string drift |
| 21 Apr 2026 | Any user Type + Call Center role = CRM access | Lean approach — no new hiring categories needed, roles assignable to any Type |
| 22 Apr 2026 | Graphify installed as permanent Claude Code skill | 71x fewer tokens per codebase query — knowledge graph replaces manual file reads |
| 22 Apr 2026 | Rebuild graph after every phase commit: /opt/homebrew/bin/graphify update . | Always keep graph current — stale graph gives wrong answers |
