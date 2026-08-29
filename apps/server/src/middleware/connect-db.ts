import type { MiddlewareHandler } from "hono/types";
import type { Low } from "lowdb";

import type { IDatabase } from "@server/types/db";
import { createDatabase } from "@server/utils/db";

export type IHonoDbVariables = {
	db: Low<IDatabase>;
};

export const createDbConnection = <
	TEnv extends {
		Variables: IHonoDbVariables;
	},
>(): MiddlewareHandler<TEnv> => {
	return async (c, next) => {
		const db = await createDatabase();

		c.set("db", db);

		await next();
	};
};
