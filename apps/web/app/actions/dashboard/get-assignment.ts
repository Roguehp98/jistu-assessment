import { array, intersect, literal, object, string } from "valibot";

import { AssignmentSchema, ShipmentSchema } from "@repo/value";
import type { ACTION_TAG } from "@web/libs/actions";
import { fetchValidated } from "@web/libs/fetch";
import { ACTION_STATUS } from "@web/types/system";

export const AssignmentDetailSchema = intersect([
	AssignmentSchema,
	object({ shipments: array(ShipmentSchema) }),
]);

const GetAssignmentApiResponseSchema = object({
	data: object({ data: AssignmentDetailSchema }),
	message: string(),
	status: literal(ACTION_STATUS.SUCCESS),
});

export const getAssignment = async ([, assignmentId]: [ACTION_TAG.GET_ASSIGNMENT, string]) => {
	return await fetchValidated(GetAssignmentApiResponseSchema, `/api/assignments/${assignmentId}`);
};
