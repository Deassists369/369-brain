# DeAssists Harness Architecture
# Created: 3 May 2026
# Owner: Shon AJ | Brain: VEERABHADRA

## What the harness IS
An orchestrator. It coordinates existing slash commands, agents, and rules into reliable end-to-end workflows. It logs every action to harness_runs. It pauses at approval gates. It resumes from failure.

## What the harness IS NOT
A replacement for the Coding Constitution, the slash commands, the agents, or the hooks. Those remain the single source of truth for their domains.

## Source of truth — never duplicate
- Coding rules: 369-brain/CODING-CONSTITUTION.md (A1-A21)
- Workflow commands: ~/.claude/369/commands/
- Agents: ~/.claude/369/agents/
- Hooks: ~/.claude/369/hooks/
- The harness READS from these. The harness does not own these.

## What the harness owns
- harness/core/ — reusable logger, workspace, state machine, model routing
- harness/[name]/ — domain-specific orchestration (eagle, onboarding, recruitment, etc)
- tickets/ — work queue (open → awaiting-approval → complete)
- previews/ — HTML previews waiting for Shon's approval
- intelligence/harness-runs/[name].jsonl — run logs (today JSON, tomorrow MongoDB)

## Future harnesses (add as Stage 2+ phases)
- onboarding-harness — tenant onboarding (BCBT first)
- recruitment-harness — lead routing, follow-ups, conversions
- admissions-harness — applications, document verification, university submission
- finance-harness — fees, invoices, commissions, DATEV
- sms-harness — attendance, results, certificates
- document-harness — RAG-powered document verification
- self-improvement-harness — meta-harness that fixes recurring failures

All future harnesses inherit harness/core/. They write to harness_runs with their own harness_name. One observability layer for the whole platform.

## harness_runs schema
Each run is a JSON object:
{
  run_id, harness, feature, started_at, completed_at,
  status: 'running' | 'awaiting-approval' | 'executing' | 'complete' | 'failed' | 'rejected' | 'blocked',
  phases: [{ phase, status, detail, timestamp }],
  approval_history: [{ phrase, timestamp, by }],
  preview_path, tenant_id, error
}

Migration path: today JSONL files. June 2026 Latha creates MongoDB collection in portal backend with same schema. Then migrate.
