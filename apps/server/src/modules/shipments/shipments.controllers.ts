import { createFactory } from "hono/factory";

import { Validator } from "@server/middleware/validator";
import type { IServerEnv } from "@server/types/env";
import { error, success } from "@server/utils/response";

import {
	createShipmentSchema,
	shipmentParamsSchema,
	updateShipmentSchema,
} from "./shipments.schema";
import {
	getManyShipments as getManyShipmentsService,
	getShipment as getShipmentService,
} from "./shipments.services";
import {
	createShipment as createShipmentService,
	deleteShipment as deleteShipmentService,
	updateShipment as updateShipmentService,
} from "./shipments-processing.services";

const factory = createFactory<IServerEnv>();

export const getManyShipments = factory.createHandlers((c) => {
	const db = c.var.db;
	const requestUrl = c.req.url;
	const shipments = getManyShipmentsService(db, requestUrl);

	return c.json(success({ data: shipments }));
});

export const getShipment = factory.createHandlers(Validator("param", shipmentParamsSchema), (c) => {
	const db = c.var.db;
	const { id } = c.req.valid("param");
	const shipment = getShipmentService(db, id);

	return shipment ? c.json(success({ data: shipment })) : c.json(error(null, "Not Found"), 404);
});

export const createShipment = factory.createHandlers(
	Validator("json", createShipmentSchema),
	async (c) => {
		const db = c.var.db;
		const input = c.req.valid("json");
		const result = await createShipmentService(db, input);

		return result.success
			? c.json(success({ data: result.shipment }), 201)
			: c.json(error(null, result.error), 422);
	},
);

export const updateShipment = factory.createHandlers(
	Validator("param", shipmentParamsSchema),
	Validator("json", updateShipmentSchema),
	async (c) => {
		const db = c.var.db;
		const { id } = c.req.valid("param");
		const input = c.req.valid("json");
		const result = await updateShipmentService(db, id, input);

		if (!result.success && result.error === "Not Found")
			return c.json(error(null, result.error), 404);

		return result.success
			? c.json(success({ data: result.shipment }))
			: c.json(error(null, result.error), 422);
	},
);

export const deleteShipment = factory.createHandlers(
	Validator("param", shipmentParamsSchema),
	async (c) => {
		const db = c.var.db;
		const { id } = c.req.valid("param");
		const result = await deleteShipmentService(db, id);

		if (!result.success && result.error === "Not Found")
			return c.json(error(null, result.error), 404);

		return result.success
			? c.json(success({ data: result.shipment }))
			: c.json(error(null, result.error), 422);
	},
);
