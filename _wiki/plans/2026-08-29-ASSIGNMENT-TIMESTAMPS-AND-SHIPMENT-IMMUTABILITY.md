# Assignment Timestamps And Shipment Immutability

Status: Shipped 2026-08-29.

## Objective

Standardize mutation timestamps as server-owned `updated_at` fields and protect assigned shipment history from hard deletion without adding assignment update scope that the assessment does not require.

## Pre-change State

- Shipment contracts use client-supplied `update_at`; assignment contracts have no timestamp.
- Shipment workflows recalculate every assignment summary after create, update, and delete.
- `DELETE /api/shipments/:id` currently removes assigned and unassigned shipments alike.
- Web has shipment update but no shipment delete action or assignment route UI yet.
- LowDB validates the gitignored local JSON strictly, so the generator and active local database need a coordinated migration.

## Decisions

- Use `updated_at` consistently for both resources; do not introduce assignment `updated_at` beside shipment `update_at`.
- The server owns timestamps. Create and update request bodies cannot choose `updated_at`.
- An accepted update that changes no persisted field is a no-op and retains its existing `updated_at`.
- Assignment `updated_at` changes when persisted assignment data changes, including derived `status`, `clients`, or `shipment_count`; a future label mutation follows the same rule.
- Hard delete is allowed only when `assignment_id` is `null`. See [`TRADEOFF.md`](../TRADEOFF.md#assigned-shipment-deletion).
- Deleting an assigned shipment returns `422` with `Assigned shipment cannot be deleted`.
- Releasing an `IN_TRANSIT` shipment from an assignment remains an update to `OPEN`, which already clears `assignment_id`; `DELIVERED` remains terminal.

## Non-goals

- No `PUT` or `PATCH` assignment endpoint.
- No shipment delete action or control in web until the owning page is implemented.
- No runtime compatibility alias for `update_at`; this repository uses a coordinated contract and fixture migration.
- No cancellation/archive workflow. Add an explicit domain status later rather than overloading hard delete.

## Success Criteria

- All public shipment and assignment responses expose an ISO `updated_at`; no legacy field reference remains outside this historical plan.
- Shipment create/update timestamps come from the server, not request input.
- No-op updates retain the resource's existing `updated_at`.
- Only assignments whose persisted summary changes receive a new timestamp during shipment synchronization.
- Deleting a missing shipment returns `404`; deleting an assigned shipment returns `422` without modifying either collection; deleting an unassigned shipment succeeds.
- Existing shipment transitions and automatic assignment completion continue to work.
- Freshly generated and mechanically migrated local databases pass strict Valibot validation.
- Shared schemas, server, web, and Bruno agree on field names and request/response shapes.

## Implementation

### 1. Shared Contract And Inputs

- [x] Rename `ShipmentSchema.update_at` to `updated_at` and add `AssignmentSchema.updated_at`.
- [x] Exclude `updated_at` from server create/update shipment input schemas while retaining it in response schemas.
- [x] Update inferred web form/action inputs so the drawer no longer sends a client timestamp.
- [x] Confirm query sorting uses `-updated_at`.

### 2. Atomic Server Mutations

- [x] Stamp shipment create/update inside the serialized LowDB transaction.
- [x] Extend assignment synchronization to compute the next summary before mutating it.
- [x] Change assignment `updated_at` only when `status`, `clients`, or `shipment_count` changes; unrelated shipment writes must not touch it.
- [x] Stamp assignment creation. Keep future editable fields compatible with the same mutation rule.
- [x] Preserve one database write for the shipment and all affected assignment summaries.

### 3. Delete Invariant

- [x] Change shipment deletion to look up before removal and return a typed result.
- [x] Reject `assignment_id !== null` with `Assigned shipment cannot be deleted` and map it to `422`.
- [x] Preserve `404` for missing IDs and `200` for unassigned deletion.
- [x] Verify a rejected delete leaves shipment, assignment summary, and timestamps unchanged.

### 4. Fixture And API SSOT

- [x] Update the generator to emit shipment and assignment `updated_at` fields.
- [x] Derive seeded assignment timestamps from the latest linked shipment timestamp; use generation time only for an empty seed assignment.
- [x] Mechanically migrate the active local `shipments.json`: rename existing shipment keys and derive assignment timestamps without rerandomizing records.
- [x] Update every Bruno shipment/assignment request, response, and sort example.
- [x] Add a Bruno case documenting the assigned-shipment `422` response while keeping the existing unassigned delete success case.

### 5. Documentation And Verification

- [x] Sync the short server convention pointers without duplicating this plan or the trade-off rationale.
- [x] Run `biome check --write` on every touched code and Bruno file.
- [x] Run server typecheck, web typecheck, and the root build.
- [x] Exercise create/update/delete flows and confirm timestamp changes and no-change cases against a disposable database copy.
- [x] Grep for `update_at` across code, fixture, Bruno, and docs, excluding this historical plan; expected result is empty.
- [x] Review the final diff for unrelated changes and update this plan status only after all checks pass.

## Verification

- Biome checked 64 source files; server and web typechecks passed.
- Root production build passed; Vite retained its existing large client chunk warning.
- In-memory service checks passed no-op, assignment synchronization, completion, unassignment, and delete cases.
- Local HTTP checks returned `201` with server-generated `updated_at`, `422` for assigned deletion, `404` for a missing shipment, and `200` for unassigned deletion.
