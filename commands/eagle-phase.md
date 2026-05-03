description: Execute one EAGLE phase in a fresh headless Claude Code session with clean context. Prevents context rot across long build sessions. Pass the phase spec as the argument.
Eagle Phase — Headless Execution
This command launches a single EAGLE phase as a fresh isolated Claude Code session.
The orchestrator session stays lean. Each phase gets full clean context.
Usage: /eagle-phase [phase-spec-file]
Step 1 — Read the phase spec file passed as argument.
Step 2 — Launch a headless Claude Code session:
claude --headless -p "$(cat [phase-spec-file])" > ~/.claude/369/phase-output.md
Step 3 — Read the output file when complete:
cat ~/.claude/369/phase-output.md
Step 4 — Report the phase result to the orchestrator session.
Step 5 — If result passes verification — mark phase complete and proceed to next phase.
Step 6 — If result fails — report exact failure. Do not retry automatically. Report to Shon.
Context rule: This session never loads the full conversation history. It reads only the phase spec and the brain files referenced in the spec. This keeps accuracy high across long multi-phase builds.
