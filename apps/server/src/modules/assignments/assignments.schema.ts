import { pick } from "valibot";

import { AssignmentSchema } from "@repo/value";

export const createAssignmentSchema = pick(AssignmentSchema, ["label"]);

export const assignmentParamsSchema = pick(AssignmentSchema, ["id"]);
