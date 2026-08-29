import { type InferOutput, literal, object, parse, pick, string } from "valibot";

import { ACTION_STATUS, AssignmentSchema } from "@repo/value";
import type { ACTION_TAG } from "@web/libs/actions";
import { fetchValidated } from "@web/libs/fetch";

export const DeleteAssignmentInputSchema = pick(AssignmentSchema, ["id"]);

export type DeleteAssignmentInput = InferOutput<typeof DeleteAssignmentInputSchema>;

const DeleteAssignmentApiResponseSchema = object({
	data: object({ data: AssignmentSchema }),
	message: string(),
	status: literal(ACTION_STATUS.SUCCESS),
});

export const deleteAssignment = async (
	_: [ACTION_TAG.DELETE_ASSIGNMENT],
	{ arg }: { arg: DeleteAssignmentInput },
) => {
	const { id } = parse(DeleteAssignmentInputSchema, arg);

	return await fetchValidated(DeleteAssignmentApiResponseSchema, `/api/assignments/${id}`, {
		method: "DELETE",
	});
};
