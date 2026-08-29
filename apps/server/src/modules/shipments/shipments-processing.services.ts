import type { Low } from "lowdb";
import { type InferOutput, safeParse } from "valibot";

import {
	ASSIGNMENT_STATUS,
	type Assignment,
	SHIPMENT_STATUS,
	type Shipment,
	ShipmentSchema,
} from "@repo/value";
import type { IDatabase } from "@server/types/db";
import { updateDatabase } from "@server/utils/db";

import type { createShipmentSchema, updateShipmentSchema } from "./shipments.schema";
import {
	findShipment,
	getNextShipmentId,
	insertShipment,
	removeShipment,
	replaceShipment,
} from "./shipments.services";

type CreateShipmentInput = InferOutput<typeof createShipmentSchema>;
type UpdateShipmentInput = InferOutput<typeof updateShipmentSchema>;
type JsonObject = Record<string, unknown>;
type ShipmentResult = { success: true; shipment: Shipment } | { success: false; error: string };
type DeleteShipmentResult =
	| { success: true; shipment: Shipment }
	| { success: false; error: "Assigned shipment cannot be deleted" | "Not Found" };

const STATUS_TRANSITIONS: Record<SHIPMENT_STATUS, SHIPMENT_STATUS[]> = {
	[SHIPMENT_STATUS.OPEN]: [SHIPMENT_STATUS.OPEN, SHIPMENT_STATUS.IN_TRANSIT],
	[SHIPMENT_STATUS.IN_TRANSIT]: [
		SHIPMENT_STATUS.OPEN,
		SHIPMENT_STATUS.IN_TRANSIT,
		SHIPMENT_STATUS.DELIVERED,
	],
	[SHIPMENT_STATUS.DELIVERED]: [SHIPMENT_STATUS.DELIVERED],
};

const areStringArraysEqual = (current: string[], next: string[]) =>
	current.length === next.length && current.every((value, index) => value === next[index]);

const hasShipmentChanged = (current: Shipment, next: Shipment) =>
	(Object.keys(current) as (keyof Shipment)[]).some(
		(key) => key !== "updated_at" && current[key] !== next[key],
	);

const syncAssignments = (assignments: Assignment[], shipments: Shipment[], updatedAt: string) => {
	for (const assignment of assignments) {
		const assignedShipments = shipments.filter(
			(shipment) => shipment.assignment_id === assignment.id,
		);
		const clients = [...new Set(assignedShipments.map((shipment) => shipment.client_name))];
		const shipmentCount = assignedShipments.length;
		const status =
			assignedShipments.length > 0 &&
			assignedShipments.every((shipment) => shipment.status === SHIPMENT_STATUS.DELIVERED)
				? ASSIGNMENT_STATUS.COMPLETED
				: ASSIGNMENT_STATUS.OPEN;
		const hasChanged =
			assignment.status !== status ||
			assignment.shipment_count !== shipmentCount ||
			!areStringArraysEqual(assignment.clients, clients);

		if (!hasChanged) continue;

		assignment.clients = clients;
		assignment.shipment_count = shipmentCount;
		assignment.status = status;
		assignment.updated_at = updatedAt;
	}
};

const prepareShipment = (
	candidate: JsonObject,
	assignments: Assignment[],
	currentShipment?: Shipment,
): ShipmentResult => {
	const parsed = safeParse(ShipmentSchema, candidate);

	if (!parsed.success) return { success: false, error: "Invalid shipment data" };

	const shipment = parsed.output;

	if (currentShipment && !STATUS_TRANSITIONS[currentShipment.status].includes(shipment.status))
		return {
			success: false,
			error: `Cannot change status from ${currentShipment.status} to ${shipment.status}`,
		};

	if (shipment.status === SHIPMENT_STATUS.OPEN) {
		shipment.assignment_id = null;

		return { success: true, shipment };
	}

	if (!shipment.assignment_id)
		return { success: false, error: `Assignment is required for ${shipment.status} shipments` };

	const assignment = assignments.find(({ id }) => id === shipment.assignment_id);

	if (!assignment) return { success: false, error: "Assignment not found" };

	if (
		shipment.status === SHIPMENT_STATUS.IN_TRANSIT &&
		assignment.status !== ASSIGNMENT_STATUS.OPEN
	)
		return { success: false, error: "In-transit shipments require an open assignment" };

	if (
		currentShipment?.status === SHIPMENT_STATUS.IN_TRANSIT &&
		shipment.status === SHIPMENT_STATUS.DELIVERED &&
		shipment.assignment_id !== currentShipment.assignment_id
	)
		return { success: false, error: "Assignment cannot change when delivering a shipment" };

	return { success: true, shipment };
};

export const createShipment = (database: Low<IDatabase>, input: CreateShipmentInput) => {
	return updateDatabase(database, (data) => {
		const updatedAt = new Date().toISOString();
		const shipmentResult = prepareShipment(
			{ ...input, id: getNextShipmentId(data.shipments), updated_at: updatedAt },
			data.assignments,
		);

		if (!shipmentResult.success) return shipmentResult;

		insertShipment(data.shipments, shipmentResult.shipment);
		syncAssignments(data.assignments, data.shipments, updatedAt);

		return shipmentResult;
	});
};

export const updateShipment = (
	database: Low<IDatabase>,
	shipmentId: string,
	input: UpdateShipmentInput,
) => {
	return updateDatabase(database, (data) => {
		const currentShipment = findShipment(data.shipments, shipmentId);

		if (!currentShipment) return { success: false, error: "Not Found" } as const;

		const shipmentResult = prepareShipment(
			{ ...currentShipment, ...input, id: shipmentId },
			data.assignments,
			currentShipment,
		);

		if (!shipmentResult.success) return shipmentResult;
		if (!hasShipmentChanged(currentShipment, shipmentResult.shipment))
			return { success: true, shipment: currentShipment } as const;

		const updatedAt = new Date().toISOString();
		shipmentResult.shipment.updated_at = updatedAt;

		replaceShipment(data.shipments, shipmentId, shipmentResult.shipment);
		syncAssignments(data.assignments, data.shipments, updatedAt);

		return shipmentResult;
	});
};

export const deleteShipment = (
	database: Low<IDatabase>,
	shipmentId: string,
): Promise<DeleteShipmentResult> => {
	return updateDatabase(database, (data): DeleteShipmentResult => {
		const shipment = findShipment(data.shipments, shipmentId);

		if (!shipment) return { success: false, error: "Not Found" };
		if (shipment.assignment_id !== null)
			return { success: false, error: "Assigned shipment cannot be deleted" };

		removeShipment(data.shipments, shipmentId);

		return { success: true, shipment };
	});
};
