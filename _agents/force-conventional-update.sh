#!/usr/bin/env bash
# PostToolUse (Write/Edit): nudge conventions check after an edit. Never blocks (additionalContext only).
# Fixed-size nudge; agent walks its own diff. Fires per edit. Pairs w/ AGENTS.md Verify.

set -uo pipefail

command -v jq >/dev/null 2>&1 || exit 0

read -r -d '' msg <<'EOF'
**CONVENTIONS CHECK — MANDATORY AFTER EVERY EDIT. NO EXCEPTIONS. Non-trivial edit = you MUST run all steps below before replying.**

- 📐 = conventions check activated.
- Walk every change this turn (`git diff`), all files.
- Re-read `_wiki/CONVENTIONS.md` + per-app `## Conventions` — actually open them, do not rely on memory.
- Diff edit vs guide. Violation → FIX CODE. Missing rule → ADD ONLY IF pattern worth canonizing.
- Test/lint/logs. Lint touched: `biome check --write <files>`.
- Trivial edit → SKIP.
EOF

jq -n --arg ctx "$msg" '{hookSpecificOutput:{hookEventName:"PostToolUse",additionalContext:$ctx}}'
