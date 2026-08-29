import { Hono } from "hono";

import {
	createShipment,
	deleteShipment,
	getManyShipments,
	getShipment,
	updateShipment,
} from "./shipments.controllers";

const shipmentRoutes = new Hono()
	.get("/", ...getManyShipments)
	.get("/:id", ...getShipment)
	.post("/", ...createShipment)
	.put("/:id", ...updateShipment)
	.delete("/:id", ...deleteShipment);

export default shipmentRoutes;
