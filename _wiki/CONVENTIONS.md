# Conventions

Shared standards. Per-app → see [`_wiki/apps/`](apps/).

## Naming

- kebab files; StartCase components; camelCase fn/var (`verb+ctx`, e.g. `getUserProfile`). English, descriptive, NO shorthand.
- File name = noun of export, always (`external-link-handler.ts`, `skia-warmup.ts`) — except `actions/` (action-creator verb+object, e.g. `create-user.ts`).
- Locale keys: kebab + trailing number (`key-1`).
- Rename → grep 6 ways: refs, types, strings, dynamic imports, barrels, tests/mocks.

## Style

- `type` not `interface`. `I<Name>` meaningful (NO `IProps`/`Props` postfix). Props = `I<Component>`; `FC<I<Component>>`; file = kebab.
- Arrow > `function` decl.
- Ternary only if it fits 1 line; else if/else.
- Padding lines: group logic into readable chunks with blank lines.
  - Blank line before `return`, `if`/`else`, `switch`, `for`/`while`.
  - Blank line after a block (`}`).
  - Inline if 1 statement.
- Comments: `/* */` only, NO watermark, **telegraphic**, **1 line (CRITICAL)**, standalone > inline, no trivial.
- React order: custom hooks → React APIs → vars/handlers → effects → JSX; memoize if needed.
- Exports (`hooks/`, `ui/elements/`): default = main hook/component; named = secondary (helpers, types).

## Code & quality

- DRY/KISS/SOLID/YAGNI. Prefer libs (`es-toolkit`, `ahooks`).
- Small pure fns, early return, NO premature abstraction.
- Deps: pin exact. **NO `^`/`~`**.
- Perf/sec: lazy-load, DB index, HTTP cache; sanitize, authz, param queries, HTTPS; scan staged diff for secrets → leaked = flag + rotate.
- A11y/UX: semantic HTML, ARIA, contrast, alt; clear states (load/error/feedback/validation).
- Review: own pass.

## Git

- Conventional commits, lowercase. Title <100 chars, concise. Body: telegraphic bullets, each line `- `.
- NO auto commit/push unless told. NEVER bypass hooks / `--no-verify`.
