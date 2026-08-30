# Commands

All `npm run …` from repo root.

| Command | Does |
| ------- | ---- |
| `npm run build` | Build all workspace packages and apps through Turborepo. |
| `npm run clean` | Run each workspace's clean task through Turborepo. |
| `npm run dev` | Load the root `.env` and start workspace development tasks through Turborepo. |
| `npm run kill:port` | Force-stop TCP listeners on ports `3000` and `3001` on Unix systems with `lsof`. |
| `npm run lint:apply` | Run Biome across the repo and apply safe and unsafe fixes. |
| `npm run lint:check` | Check repo formatting and lint rules with Biome without writing changes. |
| `npm run prepare` | Install or refresh the repository's Husky Git hooks. |
