# Trade-offs

## Assigned Shipment Deletion

A shipment with an `assignment_id` is immutable against hard deletion. An `IN_TRANSIT` shipment must first transition to `OPEN`, which clears its assignment; a terminal `DELIVERED` shipment remains assigned and cannot be deleted.

This preserves assignment summaries and delivery history at the cost of preventing cleanup through the generic delete endpoint. A future correction workflow should use explicit cancellation or archival semantics instead of weakening this invariant.

Implementation scope and verification are tracked in [Assignment Timestamps And Shipment Immutability](plans/2026-08-29-ASSIGNMENT-TIMESTAMPS-AND-SHIPMENT-IMMUTABILITY.md).
