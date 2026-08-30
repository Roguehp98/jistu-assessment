# Server - `apps/server/`

Hono + LowDB with JSON file, TS, Valibot

## Conventions

- `dev` must generate `shipments.json` only when missing; keep `generate` as the explicit reset command. Resolve the data path from the script location, not the process working directory.
- **Layers**: Routes → Controller (HTTP/val) → `*-processing.service` (cross-aggregate, shared controller+worker) → Service (logic)
- **Errors** → [§Errors](#errors). Built-in `HttpException`. **NO** `CustomError`
