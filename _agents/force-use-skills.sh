#!/usr/bin/env bash
# UserPromptSubmit hook: enforce evaluate -> activate -> impl.
# Claude Code -> Skill(...); Codex/no Skill tool -> open SKILL.md + follow.
# Never blocks (additionalContext only).

set -uo pipefail

command -v jq >/dev/null 2>&1 || exit 0

read -r -d '' msg <<'EOF'
MANDATORY SKILL ACTIVATION

- 🎯 = skill check activated.
- FIRST LINE OF EVERY REPLY, NO EXCEPTIONS, BEFORE ANY OTHER TEXT/TOOL CALL: print `[SKILL] - <name>` per pick, or `NO SKILL` if none fit. This line is mandatory even under other response-format rules.
- EVALUATE — pick <=2 best-fit.
- ACTIVATE — each YES -> Skill(skill) now. No Skill tool -> say "NO Skill()", FORCE READ SKILL.md + follow before implementation.
- IMPLEMENT — after ACTIVATE only.

RULES: <=2 skills; no full-list audits; every pick must activate.
EOF

jq -n --arg ctx "$msg" '{hookSpecificOutput:{hookEventName:"UserPromptSubmit",additionalContext:$ctx}}'
