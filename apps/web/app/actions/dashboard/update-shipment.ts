import { type InferOutput, object, parse, pick } from "valibot";

import { ShipmentSchema } from "@repo/value";
import { type ACTION_TAG, INITIAL_ACTION_STATUS } from "@web/libs/actions";
import { fetchValidated } from "@web/libs/fetch";
import { ACTION_STATUS } from "@web/types/system";

const UpdateShipmentFieldsSchema = pick(ShipmentSchema, [
	"delivery_by_date",
	"lat",
	"lng",
	"update_at",
]);

export const UpdateShipmentInputSchema = object({
	shipment: ShipmentSchema,
	updates: UpdateShipmentFieldsSchema,
});

export type UpdateShipmentInput = InferOutput<typeof UpdateShipmentInputSchema>;

export const initialUpdateShipmentState = {
	...INITIAL_ACTION_STATUS,
	data: null,
};

export const updateShipment = async (
	_: [ACTION_TAG.UPDATE_SHIPMENT],
	{ arg }: { arg: UpdateShipmentInput },
) => {
	const { shipment, updates } = parse(UpdateShipmentInputSchema, arg);
	const data = await fetchValidated(ShipmentSchema, `/shipments/${shipment.id}`, {
		body: {
			client_name: shipment.client_name,
			label: shipment.label,
			status: shipment.status,
			arrival_date: shipment.arrival_date,
			delivery_by_date: updates.delivery_by_date,
			eta: shipment.eta,
			update_at: updates.update_at,
			warehouse_id: shipment.warehouse_id,
			lat: updates.lat,
			lng: updates.lng,
		},
		method: "PUT",
	});

	return {
		...INITIAL_ACTION_STATUS,
		status: ACTION_STATUS.SUCCESS,
		data,
	};
};
