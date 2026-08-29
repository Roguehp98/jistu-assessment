import { Hono } from "hono";

import assignmentRoutes from "./assignments/assignments.routes";
import shipmentRoutes from "./shipments/shipments.routes";

const routes = new Hono();

routes.route("/assignments", assignmentRoutes);
routes.route("/shipments", shipmentRoutes);

export default routes;
