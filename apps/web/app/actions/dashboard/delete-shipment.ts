import { type InferOutput, literal, object, parse, pick, string } from "valibot";

import { ACTION_STATUS, ShipmentSchema } from "@repo/value";
import type { ACTION_TAG } from "@web/libs/actions";
import { fetchValidated } from "@web/libs/fetch";

export const DeleteShipmentInputSchema = pick(ShipmentSchema, ["id"]);

export type DeleteShipmentInput = InferOutput<typeof DeleteShipmentInputSchema>;

const DeleteShipmentApiResponseSchema = object({
	data: object({ data: ShipmentSchema }),
	message: string(),
	status: literal(ACTION_STATUS.SUCCESS),
});

export const deleteShipment = async (
	_: [ACTION_TAG.DELETE_SHIPMENT],
	{ arg }: { arg: DeleteShipmentInput },
) => {
	const { id } = parse(DeleteShipmentInputSchema, arg);

	return await fetchValidated(DeleteShipmentApiResponseSchema, `/api/shipments/${id}`, {
		method: "DELETE",
	});
};
