DeAssists — 369-ECC Agent Reference
Location: 369-brain/AGENTS.md
Updated: 2 May 2026
These 8 agents live at ~/.claude/369/agents/ on the Mac Mini

How agents work

Each agent is a focused version of Claude Code for one specific job.
When you need that job done, tell Cursor to use that agent.
Agents read the brain files relevant to their job automatically.

The 8 DeAssists Agents

Agent                       | Job                                                                                              | When to use
deassists-architect         | Architecture and system design. Never writes code. Applies Intelligence Layer three questions before every answer. | Before any major structural decision
deassists-reviewer          | Reviews TypeScript files against all 18 coding constitution rules. Reports exact violations with line numbers. | After any new file is written
deassists-security          | JWT, AWS, Stripe, never-touch files. Blocks auth commits without audit. | Before any auth or payment commit
deassists-sidebar-audit     | Three-layer access audit for every role. Pass or fail per route. | Any time sidemenu.ts is changed
deassists-eagle             | EAGLE Modes 1-3. Stops at every approval gate. Never proceeds without exact phrase. | Every new feature build
deassists-data-readiness    | Classifies feature as State 1, 2A, 2B, or 3 before any spec is written. | Start of every EAGLE Mode 1
deassists-build-resolver    | Fixes TypeScript build errors with minimum diff. Root cause in one sentence first. | When build fails
deassists-latha-handover    | Complete PR package — change log, description, WhatsApp message. | Before every portal commit

Agent slash command shortcuts

/eagle-mode1     — triggers deassists-eagle Mode 1
/eagle-mode2     — triggers deassists-eagle Mode 2
/eagle-mode3     — triggers deassists-eagle Mode 3
/sidebar-audit   — triggers deassists-sidebar-audit
/data-check      — triggers deassists-data-readiness
/latha-handover  — triggers deassists-latha-handover
/session-open    — loads session state and confirms position
/session-close   — closes session, updates memory, commits brain
