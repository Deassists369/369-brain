# EAGLESKILL CONFIG — DeAssists / Three Sixty Nine GmbH
# Project-specific configuration for EAGLE
# Pairs with: EAGLESKILL.md (universal pattern)
# Save to: ~/deassists-workspace/369-brain/skills/eagleskill/eagleskill-config.md
# Owner: Shon AJ | Brain: VEERABHADRA
# Last updated: 29 April 2026

---

## PURPOSE

This file is the project-specific configuration EAGLE reads at the start
of every session. It pairs with the universal `EAGLESKILL.md` to deploy
EAGLE on the DeAssists portal.

**To deploy EAGLE on a different project:** copy `EAGLESKILL.md` as-is,
then write a new version of THIS file (`eagleskill-config.md`) with the
new project's paths, names, conventions, and people.

The methodology in EAGLESKILL.md never changes per project. This file
is what changes.

---

## PROJECT IDENTITY

**Project name:** DeAssists Portal
**Company:** Three Sixty Nine GmbH, Berlin, Germany
**Repository owner:** Deassists369

---

## REPOSITORY STRUCTURE

EAGLE works across two repositories that must NEVER mix in a commit.

```
BRAIN REPOSITORY:
  Local path:  ~/deassists-workspace/369-brain/
  GitHub:      github.com/Deassists369/369-brain (public)
  Active branch: main
  Who commits: Shon directly (no review needed)

PRODUCTION REPOSITORY:
  Local path:  ~/deassists-workspace/deassists/
  GitHub:      github.com/Deassists369/deassists (private)
  Active branch: feature/portal.shon369
  Integration branch: dev_v2
  Production branch: main (deployed)
  Who commits: Latha — after reviewing every change
  Shon does NOT commit to deassists directly. Ever.
```

**Cross-repo rules:**
- Never commit brain files to deassists
- Never commit portal code to 369-brain
- Never mix files from both repos in one commit
- CLAUDE.md lives in 369-brain only — never in deassists

---

## PRODUCTION CODEBASE STRUCTURE

```
~/deassists-workspace/deassists/
├── apps/
│   ├── backend-nest/        NestJS API, port 8000
│   ├── cms-next/            Staff portal, port 4002
│   ├── website-next/        Public website, port 4001
│   └── mui-cms-next/        SEPARATE app — never touched for portal work
└── libs/
    ├── shared/              Enums, constants, helpers, interfaces
    │   ├── constants/       user.types.ts, lead.constants.ts, collections.ts, endpoints.enum.ts
    │   ├── functions/       permission.helper.ts (MAXIMUM RISK)
    │   ├── models/          sidemenu.ts (MEDIUM RISK)
    │   └── interfaces/      All shared interfaces
    ├── shared-ui/           UI components, layouts, sidebar renderer (PRIMARY for portal work)
    └── react-query/         queries/, hooks/ — the 4-layer API chain
```

**Tech stack:**
- Backend: NestJS, REST API, port 8000
- Database: MongoDB Atlas (EU hosting)
- Storage: AWS S3
- Auth: JWT + cookies-next (axios client handles auth automatically)
- Frontend portal: Next.js + TypeScript, port 4002
- Public website: Next.js, port 4001
- Mobile: React Native (separate developer, same NestJS backend)
- Monorepo: Nx + pnpm
- Server: Mac Mini M4 (permanent company server, Tailscale IP 100.125.115.8)
- Process management: pm2 (use `pm2 stop cms`, NEVER `kill -9`)

---

## PROTOTYPE LOCATION

Path: `~/deassists-workspace/369-brain/prototypes/deassists-platform.html`

This is the source of truth for desired UX, tenant model, and
architectural intent. EAGLE reads this in Mode 0 baseline and Mode 1
reconciliation.

When EAGLE updates the prototype (in either MIGRATION or CAPABILITY
mode), the updated file is committed to the brain repo before the next
EAGLE round.

---

## PEOPLE

| Person | Role | Portal access | Notes |
|---|---|---|---|
| Shon AJ | CEO, founder | SUPER_ADMIN | All decisions; tests every feature; approves before Latha sees code |
| Latha | Lead developer | SUPER_ADMIN | Reviews every diff; commits to GitHub; merges branches; never sees 369-brain |
| Don | Senior Manager | MANAGER | University B2B partnerships; visa services; grievance officer |
| Sruthi | BDMS, University Coordination | MANAGER | All universities except BCBT and XU |
| Santosh | Application Lead, Escalation Owner | MANAGER | All BCBT and XU applications; primary escalation owner |
| Anandhu | Call Centre, BCBT | TEAM_LEAD | First contact + qualification + follow-up for BCBT |
| Midhun | Call Centre + Application, BCBT/XU | TEAM_LEAD | Dual role |
| Stalin | Call Centre, Non-BCBT | TEAM_LEAD | Commission-based |
| Gopika | Operations, Data Entry | TEAM_LEAD | Tags social media leads; backup for Lenin |
| Lenin | Application Team | AGENT (application access) | Applications for non-BCBT/XU |
| Sajir | Operations Intern, Germany | AGENT | FSJ, Ausbildung, accommodation |
| Amala | Operations Intern, Germany | AGENT | Social media, on-ground ops |

Build flow: VEERABHADRA plans → Claude Code (or Cursor agent) builds
→ Shon tests → Latha reviews → Latha commits.

---

## NEVER-TOUCH FILES

EAGLE must NEVER modify these files in any mode:

```
PRODUCTION REPO (deassists/):
  apps/cms-next/pages/universitiesd/                    BCBT white-label
  apps/backend-nest/src/core/entities/extendables/payment.entity.ts
  apps/mui-cms-next/                                    Separate app
  MASTER-RUN.cjs                                        Google Sheets script (live)
  Any Stripe/payment logic
  scope.guard.ts                                        Security guard, blocker (~L79)
  package.json / pnpm-lock.yaml                         Without explicit Shon approval AND Latha awareness
  Any file containing JWT secrets or credentials
  Any file under .superpowers/ .cursor/ .compound-engineering/
  pre-commit Husky hooks                                Permanently removed, never reinstall

BRAIN REPO (369-brain/):
  archive/                                              Historical files, never modify
  code-snapshot/                                        Reference code from retired branches
  graphify-out/                                         Knowledge graph output
  Old EAGLESKILL versions (e.g., EAGLESKILL-v2.0-2026-04-26.md)
```

If EAGLE encounters a request that would touch any of these, it refuses
with the standard refusal block citing this list.

---

## REQUIRED READING — TIER 1 (always loaded)

EAGLE reads these files at the start of every session:

```
1. ~/deassists-workspace/369-brain/CLAUDE.md
   The lean rules document for Claude Code on this project.
   Approximate size: 126 lines.

2. ~/deassists-workspace/369-brain/VEERABHADRA.md
   The charter — VEERABHADRA's identity, the company, the missions,
   working principles, what VEERABHADRA is becoming.
   Approximate size: 219 lines.

3. ~/deassists-workspace/369-brain/skills/eagleskill/eagleskill-config.md
   This file. Project-specific configuration.
   Approximate size: ~250 lines.

4. ~/deassists-workspace/369-brain/memory/decisions.md
   Every locked decision, dated and append-only.
   Approximate size: 90 lines (growing).

5. ~/deassists-workspace/369-brain/memory/session-state.md
   Where the build is right now: active branch, current task, blockers.
   Approximate size: 170 lines.
```

Total Tier 1 cost: ~17,000 tokens. Acceptable for every session.

---

## REQUIRED READING — TIER 2 (when starting actual task work)

EAGLE reads these files based on what the task involves:

```
6. ~/deassists-workspace/369-brain/patterns/api-patterns.md
   When the task involves API calls. The 4-layer chain.

7. ~/deassists-workspace/369-brain/patterns/permission-patterns.md
   When the task touches sidebar, roles, or access control.

8. ~/deassists-workspace/369-brain/patterns/git-workflow.md
   When the task involves committing.

9. ~/deassists-workspace/369-brain/project/architecture.md
   When creating new files (where do they go?).

10. ~/deassists-workspace/369-brain/project/never-touch.md
    Always read before any production write (back-up to this config file).

11. ~/deassists-workspace/369-brain/project/design-system.md
    When the task involves UI tokens or visual changes.

12. ~/deassists-workspace/369-brain/change-logs/BRANCH-CHANGE-LOG-portal.shon369.md
    Recent task history on the active branch.

13. ~/deassists-workspace/369-brain/skills/eagleskill/eagle-baseline-system-readout.md
    The Mode 0 baseline. EAGLE re-reads this every session for codebase context.
    (If missing — Mode 0 has not yet run; EAGLE refuses to start any task work.)
```

---

## REQUIRED READING — TIER 3 (referenced when needed, not auto-loaded)

EAGLE knows these exist and pulls them when context demands:

```
14. ~/deassists-workspace/369-brain/THE-DEASSISTS-OS.md
    The foundational ops playbook. 1,451 lines — too expensive to
    auto-load every session. Read when:
    - First session for a fresh agent
    - Working on cross-system architecture
    - Anything involving the dual-mode (operator + platform) principle

15. ~/deassists-workspace/369-brain/services/crm-brain.md
    When the task is CRM-specific.

16. ~/deassists-workspace/369-brain/services/admissions-brain.md
    When the task touches university admissions.

17. ~/deassists-workspace/369-brain/services/accommodation-brain.md
    When the task touches accommodation.

18. ~/deassists-workspace/369-brain/services/communications-brain.md
    When the task touches WhatsApp, email, or social channels.

19. ~/deassists-workspace/369-brain/company/staff-brain.md
    When the task involves user types, roles, or access details.

20. ~/deassists-workspace/369-brain/company/partners-brain.md
    When the task involves university partners.

21. ~/deassists-workspace/369-brain/technology/codebase-brain.md
    When deeper codebase context is needed beyond what the baseline holds.

22. ~/deassists-workspace/369-brain/prototypes/deassists-platform.html
    The current prototype. Read in Mode 0 (full) and Mode 1 (relevant section).

23. ~/deassists-workspace/369-brain/skills/eagleskill/postmortems/
    All past postmortems (when starting Mode 0 or when investigating a
    recurring issue pattern).
```

---

## FILE OUTPUT PATHS PER MODE

```
Mode 0 (baseline) outputs:
  Permanent: ~/deassists-workspace/369-brain/skills/eagleskill/eagle-baseline-system-readout.md
  Archive (when superseded): ~/deassists-workspace/369-brain/skills/eagleskill/eagle-baseline-system-readout-[YYYY-MM-DD].md

Mode 1 (reconcile) outputs:
  ~/deassists-workspace/369-brain/skills/eagleskill/reports/eagle-report-round-[N]-[topic]-[YYYY-MM-DD].md

Mode 2 (spec) outputs:
  Spec: ~/deassists-workspace/369-brain/skills/eagleskill/plans/eagle-spec-[capability]-[YYYY-MM-DD].md
  Working prototype HTML: ~/deassists-workspace/369-brain/skills/eagleskill/previews/eagle-working-prototype-[capability]-[YYYY-MM-DD].html
  Working prototype markdown: ~/deassists-workspace/369-brain/skills/eagleskill/previews/eagle-working-prototype-[capability]-[YYYY-MM-DD].md

Mode 3 (execute) outputs:
  ~/deassists-workspace/369-brain/skills/eagleskill/exec-logs/eagle-execlog-[YYYY-MM-DD]-[capability].md

Mode 4 (postmortem) outputs:
  ~/deassists-workspace/369-brain/skills/eagleskill/postmortems/eagle-postmortem-[YYYY-MM-DD]-[bug].md
  (Folder created on first postmortem.)
```

---

## COORDINATING SKILLS — DEASSISTS-SPECIFIC

EAGLE coordinates with these specialist skills (does not replace them):

```
deassists-sidebar-audit
  Path: ~/deassists-workspace/369-brain/skills/sidebar-audit.md
  Trigger: any task touching sidemenu.ts, permission.helper.ts, or user.types.ts
  EAGLE behavior:
    - Run sidebar-audit during Mode 0 (read-only) for current state
    - Run sidebar-audit during Mode 2C working-prototype generation as pre-flight
    - Refuse Mode 3 if audit reveals permission regressions

uiux-superman
  Path: ~/deassists-workspace/369-brain/skills/uiux-superman.md
  Trigger: design pass on a page (UI redesign, not new feature)
  EAGLE behavior:
    - Defer to uiux-superman for design intent and visual treatment
    - EAGLE handles the integration with prototype + production bridge
    - Two-step flow: uiux-superman produces design → EAGLE migrates
  The add-only rule still applies — uiux-superman's output cannot
  modify existing logic, only restyle.

Salesdocskill (does not interact with EAGLE — separate domain)
  Path: ~/deassists-workspace/369-brain/skills/sales-design/Salesdocskill.md
  Used for sales materials, not portal code.
```

---

## PLUGIN AVAILABILITY

The following plugins are installed in Claude Code on the Mac Mini and
available for EAGLE to invoke per the skill activation table:

```
Compound-Engineering (ce):
  /ce:plan
  /ce:work                          ← FORBIDDEN in Mode 3
  /ce-setup
  /ce:brainstorm
  /ce-slack-research                ← Available, not currently used (no Slack)

Superpowers:
  /superpowers:brainstorm           (deprecated — use /brainstorming)
  /superpowers:write-plan           (deprecated — use /writing-plans)
  /superpowers:execute-plan         ← FORBIDDEN (deprecated, would bypass review)
  /brainstorming                    ← Available (replaces deprecated /superpowers:brainstorm)
  /writing-plans                    ← Available
  /security-review                  ← Available, mandatory pre-merger
  /subagent-driven-development      ← Available, conditional
  /dispatching-parallel-agents      ← FORBIDDEN in Mode 3

Built-in:
  /config
  /claude-api
```

---

## ACTIVE BLOCKERS

Open issues EAGLE should be aware of (from session-state.md, mirrored
here for quick reference):

```
1. JWT secrets must be rotated by Latha
   NEXT_PUBLIC_JWT_SECRET and NEXT_PUBLIC_JWT_REFRESH_TOKEN_SECRET
   exposed in Git history.
   CRITICAL — pre-existing.

2. 4 AWS ACL TypeScript errors in accounts.service.ts
   Latha to fix. Pre-existing, MEDIUM priority.

3. Stripe write-back bug
   Payment status never saved to MongoDB.
   Latha to fix before production. HIGH priority.

4. Security guard bypass at scope.guard.ts ~L79
   Latha to fix before production. HIGH priority.

5. assigned_to enum EMPTY
   Needs 37 agent names from Google Sheets col K
   (=UNIQUE(K2:K9999)). Shon to populate. HIGH priority.
```

EAGLE does NOT fix these. They go through the project's normal
workflow (Latha or Shon directly). EAGLE references them so it doesn't
accidentally re-flag them as new issues during gap reports.

---

## SOP REFERENCE — THE 5-STAGE PROCESS

EAGLE plugs into this existing process (from `memory/it-change-log-sop.md`):

```
Stage 1 — PLAN
  EAGLE Mode 1 (gap report iterations) + Mode 2 (spec + working prototype)

Stage 2 — BUILD
  EAGLE Mode 3 (staged execution) — only after explicit "approved"

Stage 3 — VERIFY
  Shon, in browser. EAGLE provides URL/role/expected behavior.

Stage 4 — COMMIT
  Shon, in terminal. EAGLE provides change log entry, commit message,
  exact files to git add.

Stage 5 — LATHA HANDOVER
  Shon → Latha. EAGLE provides WhatsApp draft + PR description.

EAGLE plugs into Stages 1-2 only. Stages 3-5 stay with Shon and Latha.
```

---

## MODE 0 RE-RUN TRIGGERS

For DeAssists specifically, Mode 0 should be re-run when:

```
- A new top-level folder appears in apps/ (e.g., apps/admin-next/)
- A new core entity is added (e.g., apps/backend-nest/src/payments/)
- user.types.ts is modified (new user type added or existing renamed)
- permission.helper.ts logic changes
- A major refactor is announced
- More than 60 days have passed since last Mode 0 (drift safety)
- Any explicit Shon instruction
```

---

## VERSION HISTORY

```
v1.0 — 29 April 2026 — initial config, paired with EAGLESKILL.md v2.1
```

---

*EAGLE Config — DeAssists / Three Sixty Nine GmbH*
*Pairs with: EAGLESKILL.md (universal pattern)*
*Last updated: 29 April 2026*

*Update this file when DeAssists project structure changes.*
*The universal pattern in EAGLESKILL.md should not need to change*
*for project-specific reasons — only this file does.*
