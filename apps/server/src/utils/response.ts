import { ACTION_STATUS } from "@repo/value";

export const success = <T>(data: T, message = "") => ({
	data,
	message,
	status: ACTION_STATUS.SUCCESS,
});

export const error = <T = null>(data?: T, message = "") => ({
	data: data ?? null,
	message,
	status: ACTION_STATUS.ERROR,
});
