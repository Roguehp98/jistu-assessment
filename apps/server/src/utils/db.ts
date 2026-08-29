import { fileURLToPath } from "node:url";

import type { Low } from "lowdb";
import { JSONFilePreset } from "lowdb/node";
import { array, enum_, object, safeParse } from "valibot";

import { AssignmentSchema, SHIPMENT_STATUS, ShipmentSchema } from "@repo/value";
import type { IDatabase } from "@server/types/db";

const defaultData: IDatabase = {
	assignments: [],
	shipments: [],
	statuses: [],
};

const DatabaseSchema = object({
	assignments: array(AssignmentSchema),
	shipments: array(ShipmentSchema),
	statuses: array(object({ id: enum_(SHIPMENT_STATUS) })),
});

const databaseUrl = new URL("../../shipments.json", import.meta.url);
const databasePath = fileURLToPath(databaseUrl);

export const createDatabase = async () => {
	const database = await JSONFilePreset<IDatabase>(databasePath, defaultData);
	const parsed = safeParse(DatabaseSchema, database.data);

	if (!parsed.success)
		throw new Error(`Invalid database at ${databasePath}. Run the server generate script first.`);

	database.data = parsed.output;

	return database;
};

let writeQueue: Promise<unknown> = Promise.resolve();

export const updateDatabase = <T>(database: Low<IDatabase>, update: (data: IDatabase) => T) => {
	const transaction = writeQueue.then(async () => {
		const nextData = structuredClone(database.data);
		const result = update(nextData);

		database.data = nextData;
		await database.write();

		return result;
	});

	writeQueue = transaction.then(
		() => undefined,
		() => undefined,
	);

	return transaction;
};
