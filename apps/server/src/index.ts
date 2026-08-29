import { serve } from "@hono/node-server";

import app from "./app";

process.on("uncaughtException", (err) => {
	console.error("Uncaught exception:", err);
});

process.on("unhandledRejection", (reason, promise) => {
	console.error("Unhandled rejection at:", promise, "reason:", reason);
});

try {
	serve(
		{
			fetch: app.fetch,
			port: 3001,
		},
		(info) => {
			console.log(`Server is running on http://localhost:${info.port}`);
		},
	);
} catch (err) {
	console.error("Failed to start server:", err);
	process.exit(1);
}
