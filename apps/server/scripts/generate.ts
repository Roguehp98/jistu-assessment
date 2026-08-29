import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { ASSIGNMENT_STATUS, SHIPMENT_STATUS, type Shipment } from "@repo/value";

const statusList = Object.values(SHIPMENT_STATUS);

type Coordinates = {
	lat: number;
	lng: number;
};

type AssignmentSeed = {
	center: Coordinates;
	id: string;
	label: string;
	status: ASSIGNMENT_STATUS;
};

/* Assignment data */

const assignmentLocations = [
	{ region: "TX", center: { lat: 32.7767, lng: -96.797 } },
	{ region: "CA", center: { lat: 34.0522, lng: -118.2437 } },
	{ region: "NY", center: { lat: 40.7128, lng: -74.006 } },
	{ region: "WA", center: { lat: 47.6062, lng: -122.3321 } },
	{ region: "NJ", center: { lat: 40.7357, lng: -74.1724 } },
	{ region: "GA", center: { lat: 33.749, lng: -84.388 } },
	{ region: "IL", center: { lat: 41.8781, lng: -87.6298 } },
	{ region: "FL", center: { lat: 25.7617, lng: -80.1918 } },
];

const generateAssignmentSeeds = (): AssignmentSeed[] =>
	assignmentLocations.map(({ center, region }, index) => ({
		center,
		id: `as_${String(index + 1).padStart(3, "0")}`,
		label: `${region}-${101 + index}`,
		status:
			index < assignmentLocations.length / 2 ? ASSIGNMENT_STATUS.OPEN : ASSIGNMENT_STATUS.COMPLETED,
	}));

const generateAssignments = (
	assignmentSeeds: AssignmentSeed[],
	shipments: Shipment[],
	generatedAt: string,
) =>
	assignmentSeeds.map((assignment) => {
		const assignmentShipments = shipments.filter(
			(shipment) => shipment.assignment_id === assignment.id,
		);
		const latestShipmentUpdatedAt = assignmentShipments.reduce(
			(latest, shipment) => (shipment.updated_at > latest ? shipment.updated_at : latest),
			"",
		);

		return {
			id: assignment.id,
			label: assignment.label,
			status: assignment.status,
			clients: [...new Set(assignmentShipments.map((shipment) => shipment.client_name))],
			shipment_count: assignmentShipments.length,
			updated_at: latestShipmentUpdatedAt || generatedAt,
		};
	});

/* Shipment data */

const statuses = statusList.map((status) => ({ id: status }));
const clients = ["Sony", "Samsung", "DHL", "CargoTrans", "ShipCo", "Logix", "Oceanic"];
const warehouses = ["EWR", "LAX", "JFK", "SFO", "SEA"] as const;
const warehouseCenters: Record<(typeof warehouses)[number], Coordinates> = {
	EWR: { lat: 40.6895, lng: -74.1745 },
	LAX: { lat: 33.9416, lng: -118.4085 },
	JFK: { lat: 40.6413, lng: -73.7781 },
	SFO: { lat: 37.6213, lng: -122.379 },
	SEA: { lat: 47.4502, lng: -122.3088 },
};

const getRandomCoordinates = (center: Coordinates, maxDistanceKm = 5): Coordinates => {
	const distanceKm = Math.sqrt(Math.random()) * maxDistanceKm;
	const angle = Math.random() * 2 * Math.PI;
	const latOffset = (distanceKm * Math.cos(angle)) / 111;
	const lngOffset = (distanceKm * Math.sin(angle)) / (111 * Math.cos((center.lat * Math.PI) / 180));

	return {
		lat: center.lat + latOffset,
		lng: center.lng + lngOffset,
	};
};

const generateShipments = (assignmentSeeds: AssignmentSeed[]): Shipment[] => {
	const openAssignments = assignmentSeeds.filter(
		(assignment) => assignment.status === ASSIGNMENT_STATUS.OPEN,
	);
	const completedAssignments = assignmentSeeds.filter(
		(assignment) => assignment.status === ASSIGNMENT_STATUS.COMPLETED,
	);
	const baseDate = new Date();
	const shipments: Shipment[] = [];

	for (let i = 1; i <= 100; i++) {
		const arrival = new Date(baseDate);
		arrival.setDate(arrival.getDate() - (1 + Math.floor(Math.random() * 10)));
		const eta = new Date(arrival);
		eta.setHours(eta.getHours() + Math.floor(Math.random() * 48));
		const deliveryBy = new Date(arrival.getTime() + 2 * 86_400_000);
		const latestUpdateTime = Math.min(deliveryBy.getTime(), baseDate.getTime());
		const updatedAt = new Date(
			arrival.getTime() + 1 + Math.random() * (latestUpdateTime - arrival.getTime() - 1),
		);
		const status = statusList[i % statusList.length];
		const warehouse = warehouses[i % warehouses.length];
		let assignment: AssignmentSeed | null = null;

		switch (status) {
			case SHIPMENT_STATUS.OPEN:
				break;
			case SHIPMENT_STATUS.IN_TRANSIT:
				assignment = openAssignments[i % openAssignments.length];
				break;
			case SHIPMENT_STATUS.DELIVERED:
				assignment = completedAssignments[i % completedAssignments.length];
				break;
		}

		const coordinates = getRandomCoordinates(assignment?.center ?? warehouseCenters[warehouse]);

		shipments.push({
			id: `shp_${String(i).padStart(3, "0")}`,
			client_name: clients[i % clients.length],
			label: `${warehouse}-581-2505${20 + (i % 10)}-${i}`,
			status,
			arrival_date: arrival.toISOString(),
			delivery_by_date: deliveryBy.toISOString(),
			eta: eta.toISOString(),
			updated_at: updatedAt.toISOString(),
			warehouse_id: "581",
			assignment_id: assignment?.id ?? null,
			lat: coordinates.lat,
			lng: coordinates.lng,
		});
	}

	return shipments;
};

/* Output */

const shipmentsPath = fileURLToPath(new URL("../shipments.json", import.meta.url));
const generatedAt = new Date().toISOString();
const assignmentSeeds = generateAssignmentSeeds();
const shipments = generateShipments(assignmentSeeds);
const assignments = generateAssignments(assignmentSeeds, shipments, generatedAt);

const result = { statuses, assignments, shipments };
writeFileSync(shipmentsPath, JSON.stringify(result, null, 2));
console.log("Data generated successfully");
