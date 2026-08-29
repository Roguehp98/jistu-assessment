# General

Repo-wide static info. Commands → [COMMANDS.md](COMMANDS.md).

## Stack

| Area     | Stack                       | Path           |
| -------- | --------------------------- | -------------- |
| Web      | React Router 7 SSR (Vite)   | `apps/web/`    |
| Server   | Hono + LowDB                | `apps/server/` |
| API SSOT | Bruno collection            | `_bruno/`      |
| Docs     | Wiki (deep dives)           | `_wiki/`       |

## Requirements

- Node 24

## Ports

| Port   | App    |
| ------ | ------ |
| `3000` | web    |
| `3001` | server |

## Layout

```
apps/      server · web
packages/
_bruno/    API SSOT (hand-kept, not generated)
_agents/   Codex hooks (bash)
_wiki/     this wiki
```
