import { createFactory } from "hono/factory";

import { Validator } from "@server/middleware/validator";
import type { IServerEnv } from "@server/types/env";
import { error, success } from "@server/utils/response";

import { assignmentParamsSchema, createAssignmentSchema } from "./assignments.schema";
import {
	getAssignment as getAssignmentService,
	getManyAssignments as getManyAssignmentsService,
} from "./assignments.services";
import {
	createAssignment as createAssignmentService,
	deleteAssignment as deleteAssignmentService,
} from "./assignments-processing.services";

const factory = createFactory<IServerEnv>();

export const getManyAssignments = factory.createHandlers((c) => {
	const db = c.var.db;
	const requestUrl = c.req.url;
	const assignments = getManyAssignmentsService(db, requestUrl);

	return c.json(success({ data: assignments }));
});

export const getAssignment = factory.createHandlers(
	Validator("param", assignmentParamsSchema),
	(c) => {
		const db = c.var.db;
		const { id } = c.req.valid("param");
		const assignment = getAssignmentService(db, id);

		return assignment
			? c.json(success({ data: assignment }))
			: c.json(error(null, "Not Found"), 404);
	},
);

export const createAssignment = factory.createHandlers(
	Validator("json", createAssignmentSchema),
	async (c) => {
		const db = c.var.db;
		const input = c.req.valid("json");
		const assignment = await createAssignmentService(db, input);

		return c.json(success({ data: assignment }), 201);
	},
);

export const deleteAssignment = factory.createHandlers(
	Validator("param", assignmentParamsSchema),
	async (c) => {
		const db = c.var.db;
		const { id } = c.req.valid("param");
		const result = await deleteAssignmentService(db, id);

		if (!result.success && result.error === "Not Found")
			return c.json(error(null, result.error), 404);

		return result.success
			? c.json(success({ data: result.assignment }))
			: c.json(error(null, result.error), 422);
	},
);
