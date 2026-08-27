import { enum_, type InferOutput, number, object, string } from "valibot";

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
	warehouse_id: string(),
	lat: number(),
	lng: number(),
});

export type Shipment = InferOutput<typeof ShipmentSchema>;
