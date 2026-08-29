import { flattenErrors, sValidator } from "@hono/standard-validator";
import type { ValidationTargets } from "hono";
import type { GenericSchema, GenericSchemaAsync } from "valibot";

import { error } from "@server/utils/response";

export const Validator = <
	Target extends keyof ValidationTargets,
	Schema extends GenericSchema | GenericSchemaAsync,
>(
	target: Target,
	schema: Schema,
) => {
	return sValidator(target, schema, (result, c) => {
		if (result.success) return;

		return c.json(error(flattenErrors(result.error), "Invalid data"), 400);
	});
};
