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

import {
	findShipment,
	getNextShipmentId,
	insertShipment,
	removeShipment,
	replaceShipment,
} from "./shipment.services";
import type { createShipmentSchema, updateShipmentSchema } from "./shipments.schema";

type CreateShipmentInput = InferOutput<typeof createShipmentSchema>;
type UpdateShipmentInput = InferOutput<typeof updateShipmentSchema>;
type JsonObject = Record<string, unknown>;
type ShipmentResult = { success: true; shipment: Shipment } | { success: false; error: string };

const STATUS_TRANSITIONS: Record<SHIPMENT_STATUS, SHIPMENT_STATUS[]> = {
	[SHIPMENT_STATUS.OPEN]: [SHIPMENT_STATUS.OPEN, SHIPMENT_STATUS.IN_TRANSIT],
	[SHIPMENT_STATUS.IN_TRANSIT]: [
		SHIPMENT_STATUS.OPEN,
		SHIPMENT_STATUS.IN_TRANSIT,
		SHIPMENT_STATUS.DELIVERED,
	],
	[SHIPMENT_STATUS.DELIVERED]: [SHIPMENT_STATUS.DELIVERED],
};

const syncAssignments = (assignments: Assignment[], shipments: Shipment[]) => {
	for (const assignment of assignments) {
		const assignedShipments = shipments.filter(
			(shipment) => shipment.assignment_id === assignment.id,
		);

		assignment.clients = [...new Set(assignedShipments.map((shipment) => shipment.client_name))];
		assignment.shipment_count = assignedShipments.length;
		assignment.status =
			assignedShipments.length > 0 &&
			assignedShipments.every((shipment) => shipment.status === SHIPMENT_STATUS.DELIVERED)
				? ASSIGNMENT_STATUS.COMPLETED
				: ASSIGNMENT_STATUS.OPEN;
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
		const shipmentResult = prepareShipment(
			{ ...input, id: getNextShipmentId(data.shipments) },
			data.assignments,
		);

		if (!shipmentResult.success) return shipmentResult;

		insertShipment(data.shipments, shipmentResult.shipment);
		syncAssignments(data.assignments, data.shipments);

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

		replaceShipment(data.shipments, shipmentId, shipmentResult.shipment);
		syncAssignments(data.assignments, data.shipments);

		return shipmentResult;
	});
};

export const deleteShipment = (database: Low<IDatabase>, shipmentId: string) => {
	return updateDatabase(database, (data) => {
		const shipment = removeShipment(data.shipments, shipmentId);

		if (!shipment) return null;

		syncAssignments(data.assignments, data.shipments);

		return shipment;
	});
};
