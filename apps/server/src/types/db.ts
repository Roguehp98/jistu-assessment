import type { Assignment, SHIPMENT_STATUS, Shipment } from "@repo/value";

type Status = {
	id: SHIPMENT_STATUS;
};

export type IDatabase = {
	assignments: Assignment[];
	shipments: Shipment[];
	statuses: Status[];
};
