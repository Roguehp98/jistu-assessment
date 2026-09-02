import { parseAsJson } from "nuqs";

import LocationMapPlayground, { parseLocationMapInput } from "./location-map";

export const PLAYGROUND_UI = {
	"location-map": {
		Component: LocationMapPlayground,
		parseInput: parseLocationMapInput,
	},
} as const;

type InputParser = (value: unknown) => unknown;
type PlaygroundRegistry = Record<
	string,
	{
		Component: unknown;
		parseInput?: InputParser;
	}
>;

type PlaygroundQueryFor<Registry extends PlaygroundRegistry> = {
	[Ui in keyof Registry]: Registry[Ui] extends { parseInput: InputParser }
		? {
				ui: Ui;
				input: NonNullable<ReturnType<Registry[Ui]["parseInput"]>>;
			}
		: { ui: Ui };
}[keyof Registry];

export type PlaygroundQuery = PlaygroundQueryFor<typeof PLAYGROUND_UI>;
export type PlaygroundInput = PlaygroundQuery extends infer Query
	? Query extends { input: infer Input }
		? Input
		: never
	: never;

export const INITIAL_PLAYGROUND_QUERY = { ui: null, input: null } as const;

const isRegistryKey = <Registry extends PlaygroundRegistry>(
	registry: Registry,
	value: unknown,
): value is Extract<keyof Registry, string> =>
	typeof value === "string" && Object.hasOwn(registry, value);

export const createPlaygroundParser = <Registry extends PlaygroundRegistry>(registry: Registry) =>
	parseAsJson((value: unknown): PlaygroundQueryFor<Registry> | null => {
		if (!value || typeof value !== "object") return null;

		const { input, ui } = value as Record<string, unknown>;

		if (!isRegistryKey(registry, ui)) return null;

		const { parseInput } = registry[ui];

		if (!parseInput) return { ui } as unknown as PlaygroundQueryFor<Registry>;

		const parsedInput = parseInput(input);

		return parsedInput !== null && parsedInput !== undefined
			? ({ ui, input: parsedInput } as unknown as PlaygroundQueryFor<Registry>)
			: null;
	});

export const playgroundParser = createPlaygroundParser(PLAYGROUND_UI);
