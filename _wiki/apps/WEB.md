# Web — `apps/web/`

Public site + web app. **React Router 7 SSR** (Vite). Manual file-routes, SSR loaders/actions, `nuqs` (URL), SWR (server), Zustand (global). Tailwind first.

## Conventions

Index — detail in linked section.

- **Libs**: SWR, ahooks, zustand, valibot, ofetch, es-toolkit.
- **Domains**: auth, dashboard, marketing, standalone. → §Route groups.
- **State/routing**: Zustand global, SWR server, `nuqs` URL, local React form state, file-route + SSR. → §State + data, §Routing.
- **Data/utils**: `libs/actions` for SWR DTOs; `libs/` first. → §Data actions.
- **Layout**: multi-file page → folder (`x/index.tsx` + kids); single file → flat `x.tsx`; collapse 1-child folders.
- **Styles**: Tailwind first → §Styling.
- **Imports (auto)**: React, ahooks, react-router (`use*`, `Outlet`/`Link`/`NavLink`), es-toolkit, `clsx` (as `cn`).
- **Exports** (`hooks/`, `ui/elements/`): default = main hook/component; named = secondary (helpers, types).
- **Env**: all public env via `import.meta.env.*` (`vite.config.ts`) — **NEVER** `process.env` at runtime.
- **Playground**: `/playground` is registered only under `NODE_ENV=development`; `page.tsx` dispatches colocated UI modules from a validated `{ ui, input }` JSON query.
- **UI/Antd**: ui from `ui/elements` first -> single import from `antd`
- **Deferred overlays**: Lazy-load heavy modal or drawer bodies on first open, then keep them mounted so controlled Ant Design close transitions and cleanup can finish.
- **Location maps**: reusable map UI consumes generic points/ordered paths; routes own DTO mapping and selection state. Keep Leaflet behind the mounted client boundary and map CSS in `styles/location-map.css`.

## Layout

```
apps/web/app/
  routes/    domain groups + SEO
  actions/   server actions, mirrored by domain
  libs/      shared utils
  hooks/     reusable use-* hooks
  styles/    Tailwind
  root.tsx
apps/web/app/routes.ts
```

## Route groups

| Group          | Purpose                |
| -------------- | ---------------------- |
| `(dashboard)/` | assignments, shipments |

\+ SEO/infra files (404, `well-known/`).

## State + data

Strict boundaries, don't blur: **Zustand** global (sparingly) · **SWR** server data · **`nuqs`** URL · **local React state** forms. DTOs/SWR keys in `libs/action` (shared with mobile). `libs/` first.

Stack: HTTP `ofetch` · util `es-toolkit` · hooks `ahooks` · val `valibot` · class `clsx` as `cn`.

### Server data (SWR) — `libs/swr.ts`, `libs/actions.ts`

- **Action shape** — `actions/<domain>/<verb>-<resource>.ts` exports an async fn: GET `(_: [tag, ...scope]) => fetch(url)`, mutation `(_: [tag], { arg }) => parse(Schema, arg) → fetch(...)`. Return the validated API envelope directly; consumers unwrap it.
- **`ACTION_TAG`** enum (`libs/actions.ts`) = SWR-key SSOT. Tuple: first element = tag, rest = scope.
- **Enhanced wrappers** (`useEnhancedSWR`/`Mutation`/`Infinite`) — **never throw**; error normalized to `ACTION_STATUS`, `data` defaults to `INITIAL_ACTION_STATUS` (never `undefined`).
  - Passthrough rule: a `FetchError` whose `status` is already in `ACTION_STATUS` is forwarded verbatim; else `error.default`, `ValiError` → `error.validation`.
- `revalidateOnFocus`/`OnReconnect` are **PROD-only**. `clearSWRCache` wiped before login (paired with PostHog/Sentry reset in `use-auth`).

### URL state (`nuqs`) — parsers colocated with route

- Layout-level parser exported, extended by children: `export const parser = { ...authQueryParser, origin: parseAsStringEnum(...).withDefault(...) }`.
- Cross-route links: `createSerializer(otherPageParser, { clearOnDefault: false })` — builds returnUrl/redirect without losing defaults.
- **Open-redirect guard**: any user `returnUrl` → `getSafeReturnUrl` (rejects `//`, `/\` prefixes).

### Fetch — `libs/fetch.ts`

- Single `ofetch.create` (`credentials: "include"`) shared by SSR loaders/actions (forwards cookies) and client SWR.
- Use `fetchValidated(schema, request, options)` for runtime-validated responses; a generic on `fetch` only asserts the type and is not validation.
- `onResponse`: **401 outside `/auth/*`** → opens login via `createSerializer(loginParser, { "no-verify": true, returnUrl })`.
- `onRequest` (client-only): injects `x-posthog-distinct-id` from `getSessionDistinctId()`.
- `retry: 3` reads only. `onRequest` zeroes it for POST/PUT/PATCH/DELETE — a timed-out write may already have landed, and no order dedupe exists. ofetch takes no function for `retry`.

### Zustand

Sparingly. Pattern: `create<T>()((set) => ({...}))` + thin hook wrapping store + side-effects (timers, ref cleanup in `useIsomorphicLayoutEffect`). Examples `hooks/use-toast.ts` (singleton, hydrated into `<Toast/>`), `(standalone)/checkout/_store.ts` (module-scope; `_` prefix = not auto-routable).

## Data actions

`app/actions/<domain>/…` , call the same `libs/action` SWR defs as the client. Names `get*`/`create*`/`update*`/`delete*`.

## Routing — `app/routes.ts` (manual, NOT file-routes)

- Hand-written with RR7 helpers (`route`, `index`, `layout`, `prefix`). All paths from typed `*_ROUTES` in `libs/route.ts` — no string literals.
- Every `page.tsx` consumes RR7 types from colocated `./+types/page` (`Route.MetaArgs`, `Route.LoaderArgs`, `Route.ComponentProps`).

## Hooks — `app/hooks/`

Tiny, single-purpose, `use-*`, auto-imported. `useIsomorphicLayoutEffect` (ahooks) = SSR-safe default for any layout effect; `use-is-mounted` before `createPortal` to dodge SSR/portal mismatch.

## Styling

- **Tailwind first**, CSS in `styles/` for complex.
- **Color scheme** — root provider syncs Ant Design with system/light/dark; semantic Tailwind tokens use `light-dark()`. Toggle persistence and pre-paint init live in `libs/color-scheme.ts`.
- `safelist` regex for `grid-cols-[1-6]`/`col-span-[1-6]` — dynamic classes purge otherwise.

## `root.tsx` composition

- `<SWRConfig>` → `<NuqsAdapter>`.

## Storage — `libs/storage.ts`

Typed localStorage wrapper: one `(Key, Value, Default)` tuple per feature, no class.
