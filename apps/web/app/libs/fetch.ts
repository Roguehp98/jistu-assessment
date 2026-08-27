import { ofetch } from "ofetch";

const PAYLOAD_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export const fetch = ofetch.create({
	baseURL: import.meta.env.SERVER_URL,
	credentials: "include",
	retry: 3,
	retryDelay: 2_500,
	timeout: 30_000,
	onRequest({ options }) {
		/* writes never retry -> a timed-out POST may already have landed; ofetch takes no fn for `retry` */
		if (PAYLOAD_METHODS.has((options.method ?? "GET").toUpperCase())) options.retry = 0;

		if (typeof window === "undefined") return;
	},
	onRequestError: noop,
	onResponse({ response }) {
		const status = response?.status ?? 0;

		if (![401].includes(status)) return;
		if (typeof window === "undefined") return;
	},
});
