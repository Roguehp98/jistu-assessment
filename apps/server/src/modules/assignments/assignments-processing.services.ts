import type { Low } from "lowdb";
import type { InferOutput } from "valibot";

import { ASSIGNMENT_STATUS, type Assignment } from "@repo/value";
import type { IDatabase } from "@server/types/db";
import { updateDatabase } from "@server/utils/db";

import type { createAssignmentSchema } from "./assignments.schema";
import {
	findAssignment,
	getNextAssignmentId,
	insertAssignment,
	removeAssignment,
} from "./assignments.services";

type CreateAssignmentInput = InferOutput<typeof createAssignmentSchema>;
type DeleteAssignmentError =
	| "Assignment has shipments"
	| "Completed assignment cannot be deleted"
	| "Not Found";
type DeleteAssignmentResult =
	| { success: true; assignment: Assignment }
	| { success: false; error: DeleteAssignmentError };

export const createAssignment = (database: Low<IDatabase>, input: CreateAssignmentInput) => {
	return updateDatabase(database, (data) => {
		const assignment: Assignment = {
			id: getNextAssignmentId(data.assignments),
			label: input.label,
			status: ASSIGNMENT_STATUS.OPEN,
			clients: [],
			shipment_count: 0,
			updated_at: new Date().toISOString(),
		};

		insertAssignment(data.assignments, assignment);

		return assignment;
	});
};

export const deleteAssignment = (
	database: Low<IDatabase>,
	assignmentId: string,
): Promise<DeleteAssignmentResult> => {
	return updateDatabase(database, (data): DeleteAssignmentResult => {
		const assignment = findAssignment(data.assignments, assignmentId);

		if (!assignment) return { success: false, error: "Not Found" };
		if (assignment.status === ASSIGNMENT_STATUS.COMPLETED)
			return { success: false, error: "Completed assignment cannot be deleted" };

		const hasShipments = data.shipments.some(({ assignment_id }) => assignment_id === assignmentId);

		if (hasShipments) return { success: false, error: "Assignment has shipments" };

		removeAssignment(data.assignments, assignmentId);

		return { success: true, assignment };
	});
};
