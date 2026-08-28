import { enum_, type InferOutput, nullable, number, object, optional, string } from "valibot";

export enum SHIPMENT_STATUS {
	OPEN = "OPEN",
	IN_TRANSIT = "IN_TRANSIT",
	DELIVERED = "DELIVERED",
}

export const ShipmentSchema = object({
	id: string(),
	client_name: string(),
	label: string(),
	status: enum_(SHIPMENT_STATUS),
	arrival_date: string(),
	delivery_by_date: string(),
	eta: string(),
	update_at: string(),
	warehouse_id: string(),
	assignment_id: optional(nullable(string()), null),
	lat: number(),
	lng: number(),
});

export type Shipment = InferOutput<typeof ShipmentSchema>;
