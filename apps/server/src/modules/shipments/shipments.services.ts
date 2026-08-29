import type { Low } from "lowdb";

import type { Shipment } from "@repo/value";
import type { IDatabase } from "@server/types/db";
import { queryItems } from "@server/utils/query";

export const getManyShipments = (database: Low<IDatabase>, requestUrl: string) => {
	return queryItems(database.data.shipments, requestUrl);
};

export const getShipment = (database: Low<IDatabase>, shipmentId: string) => {
	return findShipment(database.data.shipments, shipmentId);
};

export const findShipment = (shipments: Shipment[], shipmentId: string) => {
	return shipments.find(({ id }) => id === shipmentId);
};

export const getNextShipmentId = (shipments: Shipment[]) => {
	const maxId = shipments.reduce((maximum, shipment) => {
		const id = Number.parseInt(shipment.id.replace(/^shp_/, ""), 10);

		return Number.isNaN(id) ? maximum : Math.max(maximum, id);
	}, 0);

	return `shp_${String(maxId + 1).padStart(3, "0")}`;
};

export const insertShipment = (shipments: Shipment[], shipment: Shipment) => {
	shipments.push(shipment);

	return shipment;
};

export const replaceShipment = (shipments: Shipment[], shipmentId: string, shipment: Shipment) => {
	const shipmentIndex = shipments.findIndex(({ id }) => id === shipmentId);

	if (shipmentIndex < 0) return false;

	shipments[shipmentIndex] = shipment;

	return true;
};

export const removeShipment = (shipments: Shipment[], shipmentId: string) => {
	const shipmentIndex = shipments.findIndex(({ id }) => id === shipmentId);

	if (shipmentIndex < 0) return null;

	const [shipment] = shipments.splice(shipmentIndex, 1);

	return shipment;
};
