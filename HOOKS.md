DeAssists — 369-ECC Hook Reference
Location: 369-brain/HOOKS.md
Updated: 2 May 2026
These 4 hooks live at ~/.claude/369/hooks/ on the Mac Mini

How hooks work

Hooks fire automatically at specific moments without being asked.
They cannot be bypassed. They protect the codebase from the most common mistakes.

The 4 DeAssists Hooks

pre-file-save

Fires: before any .ts or .tsx file is saved
Does: runs markdown syntax grep check (Rule A17)
Blocks: saves the file if markdown hyperlink syntax is found inside TypeScript
Example caught: UserTypes.TEAM_LEAD instead of UserTypes.TEAM_LEAD
Cost of this bug without the hook: 2 hours debugging on 2 May 2026

post-file-save

Fires: after any file inside libs/shared/ is saved
Does: displays the A18 rebuild sequence reminder
Blocks: nothing — reminds Claude Code to run the shared library rebuild before restarting cms
Example caught: sidemenu.ts changed, cms restarted without rebuild, sidebar did not update
Cost of this bug without the hook: 1 hour debugging on 2 May 2026

pre-commit

Fires: before any git commit command runs
Does: runs four checks — build clean, grep checks clean, no brain files in portal commit, no build artifacts staged
Blocks: the commit if any check fails
Example caught: tsconfig.tsbuildinfo accidentally staged alongside catalog files on 2 May 2026

session-stop

Fires: when Claude Code session ends for any reason
Does: updates session-state.md, updates activity-log.md, writes IDLE to session-lock.md, commits brain files
Blocks: nothing — runs automatically even if session-close command was not typed
Protects against: session left OPEN between days, memory updates forgotten, brain commits missed
