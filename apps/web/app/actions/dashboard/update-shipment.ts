import { type InferOutput, literal, object, parse, pick, string } from "valibot";

import { ACTION_STATUS, ShipmentSchema } from "@repo/value";
import type { ACTION_TAG } from "@web/libs/actions";
import { fetchValidated } from "@web/libs/fetch";

const UpdateShipmentFieldsSchema = pick(ShipmentSchema, [
	"assignment_id",
	"delivery_by_date",
	"lat",
	"lng",
	"status",
]);

export const UpdateShipmentInputSchema = object({
	shipment: ShipmentSchema,
	updates: UpdateShipmentFieldsSchema,
});

export type UpdateShipmentInput = InferOutput<typeof UpdateShipmentInputSchema>;

const UpdateShipmentApiResponseSchema = object({
	data: object({ data: ShipmentSchema }),
	message: string(),
	status: literal(ACTION_STATUS.SUCCESS),
});

export const updateShipment = async (
	_: [ACTION_TAG.UPDATE_SHIPMENT],
	{ arg }: { arg: UpdateShipmentInput },
) => {
	const { shipment, updates } = parse(UpdateShipmentInputSchema, arg);

	return await fetchValidated(UpdateShipmentApiResponseSchema, `/api/shipments/${shipment.id}`, {
		body: {
			assignment_id: updates.assignment_id,
			client_name: shipment.client_name,
			label: shipment.label,
			status: updates.status,
			arrival_date: shipment.arrival_date,
			delivery_by_date: updates.delivery_by_date,
			eta: shipment.eta,
			warehouse_id: shipment.warehouse_id,
			lat: updates.lat,
			lng: updates.lng,
		},
		method: "PUT",
	});
};
