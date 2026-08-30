import type { Low } from "lowdb";

import { ASSIGNMENT_STATUS, type Assignment } from "@repo/value";
import type { IDatabase } from "@server/types/db";
import { queryItems } from "@server/utils/query";

export const getManyAssignments = (database: Low<IDatabase>, requestUrl: string) => {
	return queryItems(database.data.assignments, requestUrl);
};

export const getAssignmentOptions = (database: Low<IDatabase>) => {
	return database.data.assignments
		.filter(({ status }) => status === ASSIGNMENT_STATUS.OPEN)
		.map(({ id, label }) => ({ id, label }))
		.sort(
			(left, right) => left.label.localeCompare(right.label) || left.id.localeCompare(right.id),
		);
};

export const getAssignment = (database: Low<IDatabase>, assignmentId: string) => {
	const assignment = findAssignment(database.data.assignments, assignmentId);

	if (!assignment) return;

	const shipments = database.data.shipments.filter(
		({ assignment_id }) => assignment_id === assignmentId,
	);

	return { ...assignment, shipments };
};

export const findAssignment = (assignments: Assignment[], assignmentId: string) => {
	return assignments.find(({ id }) => id === assignmentId);
};

export const getNextAssignmentId = (assignments: Assignment[]) => {
	const maxId = assignments.reduce((maximum, assignment) => {
		const id = Number.parseInt(assignment.id.replace(/^as_/, ""), 10);

		return Number.isNaN(id) ? maximum : Math.max(maximum, id);
	}, 0);

	return `as_${String(maxId + 1).padStart(3, "0")}`;
};

export const insertAssignment = (assignments: Assignment[], assignment: Assignment) => {
	assignments.push(assignment);

	return assignment;
};

export const removeAssignment = (assignments: Assignment[], assignmentId: string) => {
	const assignmentIndex = assignments.findIndex(({ id }) => id === assignmentId);

	if (assignmentIndex < 0) return null;

	const [assignment] = assignments.splice(assignmentIndex, 1);

	return assignment;
};
