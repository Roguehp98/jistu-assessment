# Trade-offs

## Assigned Shipment Deletion

A shipment with an `assignment_id` is immutable against hard deletion. An `IN_TRANSIT` shipment must first transition to `OPEN`, which clears its assignment; a terminal `DELIVERED` shipment remains assigned and cannot be deleted.

This preserves assignment summaries and delivery history at the cost of preventing cleanup through the generic delete endpoint. A future correction workflow should use explicit cancellation or archival semantics instead of weakening this invariant.

Implementation scope and verification are tracked in [Assignment Timestamps And Shipment Immutability](plans/2026-08-29-ASSIGNMENT-TIMESTAMPS-AND-SHIPMENT-IMMUTABILITY.md).

## Reassignment Before Delivery

An `IN_TRANSIT` shipment may be reassigned to another open assignment and saved. A later request may then transition that shipment to `DELIVERED` under the new assignment.

The server only rejects changing `assignment_id` in the same request that transitions `IN_TRANSIT` to `DELIVERED`. This keeps reassignment flexible while making each saved mutation explicit; it does not preserve the shipment's previous assignment history.

## Bulk Actions

Assignments and shipments currently support only individual mutations. Bulk actions would require more complex selection and confirmation flows, along with per-item results that clearly identify successful operations, failures, and their reasons.

Supporting that workflow cleanly would also require reusable bulk-action UI shared by the assignments and shipments pages. It is excluded to keep the assessment focused on the core lifecycle flows.

## LowDB Persistence And Deployment

LowDB keeps the assessment lightweight and makes the data model easy to inspect locally, but its file-based storage limits concurrency, horizontal scaling, and deployment options. A writable persistent filesystem and a single server instance are required to avoid lost updates or data corruption.

Deploying this architecture to serverless runtimes would require additional storage infrastructure or a database migration, which adds disproportionate complexity for an assessment that does not require deployment.

## Shipment Route Visualization

The current Leaflet integration orders shipment coordinates and connects their markers with straight line segments. This provides a useful visual overview but does not represent roads, travel constraints, or an executable delivery route.

A production routing workflow would require a routing engine or directions provider to calculate navigable paths, distances, and travel times between shipment locations.
