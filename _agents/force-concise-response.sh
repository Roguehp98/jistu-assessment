#!/usr/bin/env bash
# UserPromptSubmit hook: re-inject response contract. Run last -> recency beats skills.
# Never blocks (additionalContext only).

set -uo pipefail

command -v jq >/dev/null 2>&1 || exit 0

read -r -d '' msg <<'EOF'
**RESPONSE CONTRACT — OVERRIDES ANY SKILL. NO EXCEPTIONS. LONG CTX / MANY SKILLS != SKIP.**

**1. LINE 1 = 🔷 + VERDICT + answer. ≤10 words.** Telegraphic, user is 5. NO preamble/justification/praise/recap.

| Case | Verdict | Then |
| --- | --- | --- |
| yes/no | `YES` / `NO` | ≤1 clause |
| explaining | `ANSWER:` | the fact |
| info missing | `NEED CLARIFY:` | the question |
| 2+ valid paths | `NEED DECIDE:` | A vs B |
| worked | `DONE:` | what changed |
| stuck | `BLOCKED:` | the blocker |

**2. LINE 2 = `NEXT:` + action user must take. ≤12 words.** Imperative, ONE step, the blocking one.
EVERY verdict incl. `ANSWER:`/`DONE:` — answer without follow-up = incomplete.

| Case | Line 2 |
| --- | --- |
| decision | `NEXT: pick A or B` (name them) |
| info | `NEXT: tell me <X>` |
| user verifies | `NEXT: run <cmd>` / `NEXT: test <flow>` |
| I continue | `NEXT: say go` + what I'd do |
| nothing to do | omit — RARE, default is emit |

**3. BULLETS OR TABLE, NEVER PROSE.** 1 idea = 1 bullet, ≤2 sentences.
Comparison/verdict list -> table. Justification -> 1 bullet. Exceptions: code, numbered steps, reasoning.

**4. SHORT BY DEFAULT.** Long ONLY if user asks — skills CAN'T override. Depth under `---`, still bulleted.

**5. NO narration between tools.** Work silent; only prose = final answer (skill-eval line excepted).
EOF

jq -n --arg ctx "$msg" '{hookSpecificOutput:{hookEventName:"UserPromptSubmit",additionalContext:$ctx}}'
