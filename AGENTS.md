## Which file to read

| Want to                                                  | Read                                                                                                  |
| -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Repo stack, requirements, ports, layout                  | `_wiki/GENERAL.md`                                                                                    |
| Run a command (dev/build/db/mobile/lint/test)            | `_wiki/COMMANDS.md`                                                                                   |
| Change web code (routes, actions, libs)                  | `_wiki/apps/WEB.md`                                                                                   |
| Read or change API contract                              | `_wiki/API.md`                                                                                        |
| Look up code standards (naming, style, conventions, git) | `_wiki/CONVENTIONS.md` (cross-cutting) + `## Conventions` section in each `_wiki/apps/*.md` (per-app) |
| Read feature plans                                       | `_wiki/plans/`                                                                                        |
| Read a reusable lesson                                   | `_wiki/lessons/`                                                                                      |

## Flow

Clarify (if blocking) → Investigate → Plan → Implement → Cleanup → Verify → Lessons.

- **Clarify** — ambiguity → list options + assumptions first; NEVER guess silently.
- **Investigate** — skills (≤2) → Context7 for unclear lib/API (NO guess) → read source (→ **Trace**) → think deep + broad.
- **Plan** — define verifiable success criteria first; smooth user migration; plan doc if arch/risky/>5 steps.
- **Implement** — targeted edits > rewrites. NO hack → clean fix. NO "impossible-case" handling (keep boundary checks).
  - **Fix** (bug) — repro → isolate → test → fix root cause, DON'T silence the check.
  - **Trace** lib source: 3rd-party → src in `node_modules/*`, read-only, patch-package.
  - **Loop** — same failure ≥2x → STOP. Unlearn → relearn → or ask. Brief context first.
- **Cleanup** — remove orphans you add; flag other dead code/bugs, DON'T fix.
- **Verify**
  - Diff change vs `_wiki/CONVENTIONS.md` + per-app `## Conventions`; violation → FIX CODE; missing rule → ADD ONLY IF pattern worth canonizing.
  - Deslop + humanize touched files.
  - Test/lint/logs. Lint touched: `biome check --write <files>`.
  - NO blind done.
- **Lessons** — record gotchas/plans per `## Docs`.

## Behavior

- NO flattery; disagree with reasons; check or say "don't know"; NEVER invent env/endpoints/flags.
- Priority: correct + safe > simple > fast. Match code + naming.

## Docs

- **ONE owner per fact (CRITICAL)** — owner = plan/lesson file. Rows + app bullets = **POINTERS, NOT summaries**. Copy detail upward = **#1 doc defect here**.
- **App** — feature/config/convention change → sync `_wiki/apps/<APP>.md`.
  - Bullet = **rule + trap**. NOT discovery, NOT measurement, NOT rejection list, NOT audit reasoning.
  - **≤2 sentences (~300 chars)**. Over → nest sub-bullets, or derivation → lesson + link.
- **Plans/Lessons**
  - Plans `_wiki/plans/YYYY-MM-DD-UPPER-KEBAB.md`, Lessons `_wiki/lessons/UPPER-KEBAB.md`.
  - Reuse, don't dup. New/edit → sync row `_wiki/LESSONS-AND-PLANS.md`, **INSIDE the table** (NEVER append below).
  - Lesson row = symptom-first `<failure seen> → <cause> → <file>`, **≤200 chars**; agent matches on symptom.
  - Plan row = **1 sentence, ≤200 chars** = what changes + status (`Shipped <date>` / `N units` / `Research only`).
  - Row bans: **NO findings, file paths, measurements, rejection lists, per-unit breakdowns**. Those = plan file ONLY.
  - Row **>2 lines = duplicating → cut back**.
- **API** — SSOT = `_bruno/` (NOT md). Hand-kept, NO auto-gen.
- **Style** — telegraphic, NO padding. Full spec **in its owner file**, pointer everywhere else. Tick tasks; compress done plans.
