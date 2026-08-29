const getErrorMessage = (err: unknown) => {
	if (err instanceof Error) return err.message;
	if (typeof err === "string") return err;

	return "Unknown error";
};

const getErrorCause = (err: unknown) => {
	if (!(err instanceof Error)) return null;

	const cause = err.cause;

	if (cause instanceof Error) return cause.message;
	if (typeof cause === "string") return cause;

	return null;
};

export const getErrorLog = (err: unknown, path: string) => {
	return JSON.stringify({
		path,
		message: getErrorMessage(err),
		cause: getErrorCause(err),
	});
};
