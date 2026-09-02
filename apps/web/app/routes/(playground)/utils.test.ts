import { describe, expect, it, vi } from "vitest";

import { type PlaygroundQuery, playgroundParser } from "./utils";

const { defaultLocationMapInput } = vi.hoisted(() => ({
	defaultLocationMapInput: [
		"10.7725, 106.698",
		"10.7725, 106.6945",
		"10.7769, 106.7009",
		"10.7733, 106.7005",
	].join("\n"),
}));

vi.mock("./location-map", () => ({
	default: () => null,
	parseLocationMapInput: (value: unknown = defaultLocationMapInput) =>
		typeof value === "string" ? value : null,
}));

describe("playground query", () => {
	const locationMapUi = "location-map" as const;

	it("round-trips the selected UI and its input as JSON", () => {
		const query: PlaygroundQuery = {
			ui: locationMapUi,
			input: defaultLocationMapInput,
		};
		const queryValue = playgroundParser.serialize(query);

		expect(queryValue).toBe(JSON.stringify(query));
		expect(playgroundParser.parse(queryValue)).toEqual(query);
	});

	it("uses the selected UI default when input is omitted", () => {
		expect(playgroundParser.parse(JSON.stringify({ ui: locationMapUi }))).toEqual({
			ui: locationMapUi,
			input: defaultLocationMapInput,
		});
	});

	it("rejects missing or unsupported UIs and invalid location-map input", () => {
		expect(playgroundParser.parse(JSON.stringify({ input: defaultLocationMapInput }))).toBeNull();
		expect(
			playgroundParser.parse(JSON.stringify({ input: defaultLocationMapInput, ui: "unsupported" })),
		).toBeNull();
		expect(playgroundParser.parse(JSON.stringify({ input: null, ui: locationMapUi }))).toBeNull();
	});
});
