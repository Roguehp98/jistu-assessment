import { type InferOutput, literal, object, omit, parse, string } from "valibot";

import { ACTION_STATUS, ShipmentSchema } from "@repo/value";
import type { ACTION_TAG } from "@web/libs/actions";
import { fetchValidated } from "@web/libs/fetch";

export const CreateShipmentInputSchema = omit(ShipmentSchema, ["id", "updated_at"]);

export type CreateShipmentInput = InferOutput<typeof CreateShipmentInputSchema>;

const CreateShipmentApiResponseSchema = object({
	data: object({ data: ShipmentSchema }),
	message: string(),
	status: literal(ACTION_STATUS.SUCCESS),
});

export const createShipment = async (
	_: [ACTION_TAG.CREATE_SHIPMENT],
	{ arg }: { arg: CreateShipmentInput },
) => {
	const input = parse(CreateShipmentInputSchema, arg);

	return await fetchValidated(CreateShipmentApiResponseSchema, "/api/shipments", {
		body: input,
		method: "POST",
	});
};
