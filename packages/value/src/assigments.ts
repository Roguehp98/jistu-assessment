import { array, enum_, type InferOutput, number, object, string } from "valibot";

export enum ASSIGNMENT_STATUS {
	OPEN = "OPEN",
	COMPLETED = "COMPLETED",
}

export const AssignmentSchema = object({
	id: string(),
	label: string(),
	status: enum_(ASSIGNMENT_STATUS),
	clients: array(string()),
	shipment_count: number(),
});

export type Assignment = InferOutput<typeof AssignmentSchema>;
