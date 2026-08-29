import { Hono } from "hono";

import {
	createAssignment,
	deleteAssignment,
	getAssignment,
	getManyAssignments,
} from "./assignments.controllers";

const assignmentRoutes = new Hono()
	.get("/", ...getManyAssignments)
	.get("/:id", ...getAssignment)
	.post("/", ...createAssignment)
	.delete("/:id", ...deleteAssignment);

export default assignmentRoutes;
