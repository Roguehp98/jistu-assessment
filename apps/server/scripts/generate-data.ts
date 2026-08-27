import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

const shipmentsPath = fileURLToPath(new URL("../shipments.json", import.meta.url));

if (existsSync(shipmentsPath)) {
	console.log("shipment data already exists");
} else {
	await import("./generate.js");
}
