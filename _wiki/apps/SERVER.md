# Server

## Conventions

- `dev` must generate `shipments.json` only when missing; keep `generate` as the explicit reset command. Resolve the data path from the script location, not the process working directory.
- Seed assigned shipments within 5 km of internal assignment centers and unassigned shipments around warehouse centers; omit centers from JSON output and derive assignment summaries from shipments.
