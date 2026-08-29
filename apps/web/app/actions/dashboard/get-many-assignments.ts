import { array, literal, nullable, number, object, string } from "valibot";

import { type ASSIGNMENT_STATUS, AssignmentSchema } from "@repo/value";
import type { ACTION_TAG } from "@web/libs/actions";
import { fetchValidated } from "@web/libs/fetch";
import { ACTION_STATUS } from "@web/types/system";

const GetManyAssignmentsResponseSchema = object({
	first: number(),
	prev: nullable(number()),
	next: nullable(number()),
	last: number(),
	pages: number(),
	items: number(),
	data: array(AssignmentSchema),
});

const GetManyAssignmentsApiResponseSchema = object({
	data: object({ data: GetManyAssignmentsResponseSchema }),
	message: string(),
	status: literal(ACTION_STATUS.SUCCESS),
});

export const getManyAssignments = async ([, page = 1, perPage = 25, search = "", status = []]: [
	ACTION_TAG.GET_MANY_ASSIGNMENTS,
	number?,
	number?,
	string?,
	ASSIGNMENT_STATUS[]?,
]) => {
	const trimmedSearch = search.trim();
	const query: Record<string, number | string> = {
		_page: page,
		_per_page: perPage,
		_sort: "-updated_at",
	};
	const where: Record<string, unknown> = {};

	if (trimmedSearch) where.label = { contains: trimmedSearch };
	if (status.length > 0) where.status = { in: status };
	if (Object.keys(where).length > 0) query._where = JSON.stringify(where);

	return await fetchValidated(GetManyAssignmentsApiResponseSchema, "/api/assignments", {
		query,
	});
};
