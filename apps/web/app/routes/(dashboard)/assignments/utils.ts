import { parseAsArrayOf, parseAsInteger, parseAsString, parseAsStringEnum } from "nuqs";

import { ASSIGNMENT_STATUS } from "@repo/value";

const STATUS_LABELS = {
	[ASSIGNMENT_STATUS.OPEN]: "Open",
	[ASSIGNMENT_STATUS.COMPLETED]: "Completed",
};

export const ASSIGNMENT_STATUS_OPTIONS = Object.values(ASSIGNMENT_STATUS).map((value) => ({
	value,
	label: STATUS_LABELS[value],
}));

export const PAGE_SIZE_OPTIONS = [10, 25, 50];

export const parser = {
	search: parseAsString.withDefault(""),
	status: parseAsArrayOf(
		parseAsStringEnum<ASSIGNMENT_STATUS>(Object.values(ASSIGNMENT_STATUS)),
	).withDefault([]),
	page: parseAsInteger.withDefault(1),
	perPage: parseAsInteger.withDefault(25),
};
