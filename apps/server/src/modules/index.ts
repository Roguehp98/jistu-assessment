import { Hono } from "hono";

import shipmentRoutes from "./shipments/shipments.routes";

const routes = new Hono();

routes.route("/shipments", shipmentRoutes);

export default routes;
