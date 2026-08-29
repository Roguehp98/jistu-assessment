import { type InferOutput, literal, object, parse, pick, string } from "valibot";

import { ACTION_STATUS, AssignmentSchema } from "@repo/value";
import type { ACTION_TAG } from "@web/libs/actions";
import { fetchValidated } from "@web/libs/fetch";

export const CreateAssignmentInputSchema = pick(AssignmentSchema, ["label"]);

export type CreateAssignmentInput = InferOutput<typeof CreateAssignmentInputSchema>;

const CreateAssignmentApiResponseSchema = object({
	data: object({ data: AssignmentSchema }),
	message: string(),
	status: literal(ACTION_STATUS.SUCCESS),
});

export const createAssignment = async (
	_: [ACTION_TAG.CREATE_ASSIGNMENT],
	{ arg }: { arg: CreateAssignmentInput },
) => {
	const input = parse(CreateAssignmentInputSchema, arg);

	return await fetchValidated(CreateAssignmentApiResponseSchema, "/api/assignments", {
		body: input,
		method: "POST",
	});
};
