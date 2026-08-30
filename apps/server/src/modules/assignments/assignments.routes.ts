import { Hono } from "hono";

import {
	createAssignment,
	deleteAssignment,
	getAssignment,
	getAssignmentOptions,
	getManyAssignments,
} from "./assignments.controllers";

const assignmentRoutes = new Hono()
	.get("/", ...getManyAssignments)
	.get("/options", ...getAssignmentOptions)
	.get("/:id", ...getAssignment)
	.post("/", ...createAssignment)
	.delete("/:id", ...deleteAssignment);

export default assignmentRoutes;
