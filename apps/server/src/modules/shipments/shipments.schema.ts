import { omit, partial, pick } from "valibot";

import { ShipmentSchema } from "@repo/value";

export const createShipmentSchema = omit(ShipmentSchema, ["id"]);

export const updateShipmentSchema = partial(createShipmentSchema);

export const shipmentParamsSchema = pick(ShipmentSchema, ["id"]);
