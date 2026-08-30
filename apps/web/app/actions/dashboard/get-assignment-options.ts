import { array, literal, object, string } from "valibot";

import { ACTION_STATUS } from "@repo/value";
import type { ACTION_TAG } from "@web/libs/actions";
import { fetchValidated } from "@web/libs/fetch";

export const AssignmentOptionSchema = object({
	id: string(),
	label: string(),
});

const GetAssignmentOptionsApiResponseSchema = object({
	data: object({ data: array(AssignmentOptionSchema) }),
	message: string(),
	status: literal(ACTION_STATUS.SUCCESS),
});

export const getAssignmentOptions = async (_: [ACTION_TAG.GET_ASSIGNMENT_OPTIONS]) => {
	return await fetchValidated(GetAssignmentOptionsApiResponseSchema, "/api/assignments/options");
};
