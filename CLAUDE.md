DeAssists — Mission Control
Location: 369-brain/CLAUDE.md
This file is the single entry point for every agent session.
Read this first. Follow the boot sequence. Nothing else.

WHAT WE ARE BUILDING

DeAssists is an AI-first Education ERP SaaS platform.
Multi-tenant. AI-hookable. Sellable to universities globally.
First external tenant: BCBT. September 2026 target.
Read VEERABHADRA.md for the full identity and mission.
Read project/vision.md for the product vision.

BOOT SEQUENCE — run in exact order every session

1. Read this file
2. Read CODING-CONSTITUTION.md — all 18 rules
3. Read memory/session-lock.md — check STATUS
   If OPEN: hard stop. Alert Shon. Wait.
   If IDLE: write STATUS OPEN and continue.
4. Read memory/session-state.md — know where we are
5. Read memory/decisions.md — know what is locked
6. Read project/feature-registry.md — know what to build
7. Report position and await instruction

TWO REPOS — NEVER MIX

369-brain: ~/deassists-workspace/369-brain/
  Brain files, SOPs, agents, rules, hooks, commands
  Shon commits directly to main

deassists portal: ~/deassists/
  Portal code only — feature/portal.shon369
  Latha reviews before any commit

HARD STOP: never commit brain files to portal repo.
HARD STOP: never commit portal code to brain repo.
HARD STOP: never use git add . or git add -A ever.
HARD STOP: never commit to main or dev_v2 directly.

369-ECC ENFORCEMENT ENGINE

All rules, agents, hooks, and commands live at:
~/.claude/369/
This layer fires automatically. Read AGENTS.md and HOOKS.md
for the full reference. Use slash commands for all workflows:

/session-open    — start every session
/session-close   — end every session
/eagle-mode1     — EAGLE gap report
/eagle-mode2     — EAGLE spec and preview
/eagle-mode3     — EAGLE execute
/sidebar-audit   — permission audit
/latha-handover  — PR package for Latha
/data-check      — data state classification

SKILL MAP

Need                      | File
Identity and mission      | VEERABHADRA.md
All 18 coding rules       | CODING-CONSTITUTION.md
Data state classification | patterns/DATA-READINESS.md
Agent reference           | AGENTS.md
Hook reference            | HOOKS.md
Build roadmap             | project/feature-registry.md
Current session position  | memory/session-state.md
Locked decisions          | memory/decisions.md
EAGLE methodology         | skills/eagleskill/EAGLESKILL.md
Branch change log         | change-logs/BRANCH-CHANGE-LOG-portal.shon369.md

NEVER-TOUCH FILES

apps/cms-next/pages/universitiesd/
apps/backend-nest/src/core/entities/extendables/payment.entity.ts
apps/mui-cms-next/
MASTER-RUN.cjs
scope.guard.ts
Any file with JWT secrets
.env files

Hard stop if any task requires touching these. Alert Shon.

Mission Control — DeAssists ERP
Read first. Follow the sequence. Then build.
