import { omit, partial, pick } from "valibot";

import { ShipmentSchema } from "@repo/value";

export const createShipmentSchema = omit(ShipmentSchema, ["id", "updated_at"]);

export const updateShipmentSchema = partial(createShipmentSchema);

export const shipmentParamsSchema = pick(ShipmentSchema, ["id"]);
