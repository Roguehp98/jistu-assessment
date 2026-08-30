# Trade-offs

## Assigned Shipment Deletion

A shipment with an `assignment_id` is immutable against hard deletion. An `IN_TRANSIT` shipment must first transition to `OPEN`, which clears its assignment; a terminal `DELIVERED` shipment remains assigned and cannot be deleted.

This preserves assignment summaries and delivery history at the cost of preventing cleanup through the generic delete endpoint. A future correction workflow should use explicit cancellation or archival semantics instead of weakening this invariant.

Implementation scope and verification are tracked in [Assignment Timestamps And Shipment Immutability](plans/2026-08-29-ASSIGNMENT-TIMESTAMPS-AND-SHIPMENT-IMMUTABILITY.md).

## Reassignment Before Delivery

An `IN_TRANSIT` shipment may be reassigned to another open assignment and saved. A later request may then transition that shipment to `DELIVERED` under the new assignment.

The server only rejects changing `assignment_id` in the same request that transitions `IN_TRANSIT` to `DELIVERED`. This keeps reassignment flexible while making each saved mutation explicit; it does not preserve the shipment's previous assignment history.
