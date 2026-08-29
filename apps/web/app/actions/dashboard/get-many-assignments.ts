import { array, literal, object, string } from "valibot";

import { type ASSIGNMENT_STATUS, AssignmentSchema } from "@repo/value";
import type { ACTION_TAG } from "@web/libs/actions";
import { fetchValidated } from "@web/libs/fetch";
import { ACTION_STATUS } from "@web/types/system";

const GetManyAssignmentsApiResponseSchema = object({
	data: object({ data: array(AssignmentSchema) }),
	message: string(),
	status: literal(ACTION_STATUS.SUCCESS),
});

export const getManyAssignments = async ([, status]: [
	ACTION_TAG.GET_MANY_ASSIGNMENTS,
	ASSIGNMENT_STATUS?,
]) => {
	const query = {
		_sort: "label",
		...(status && { status }),
	};

	return await fetchValidated(GetManyAssignmentsApiResponseSchema, "/api/assignments", {
		query,
	});
};
