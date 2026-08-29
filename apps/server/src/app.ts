import { Hono } from "hono";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { logger } from "hono/logger";

import { createDbConnection } from "./middleware/connect-db";
import routes from "./modules";
import { getErrorLog } from "./utils/error";
import { error, success } from "./utils/response";

const app = new Hono();

app.use(logger());

app.get("/health", (c) =>
	c.json(
		success({
			ok: true,
			service: "server",
		}),
	),
);

app.use("*", cors());

app.use("/api/*", createDbConnection());

app.route("/api", routes);

app.onError((err, c) => {
	console.error("Server error", getErrorLog(err, c.req.path));

	if (err instanceof HTTPException) {
		return c.json(error(null, err.message), err.status);
	}

	return c.json(error(null, "Internal server error"), 500);
});

export default app;
