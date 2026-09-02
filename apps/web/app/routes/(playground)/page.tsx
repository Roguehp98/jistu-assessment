import { useQueryState } from "nuqs";
import type { FC } from "react";

import {
	INITIAL_PLAYGROUND_QUERY,
	PLAYGROUND_UI,
	type PlaygroundInput,
	type PlaygroundQuery,
	playgroundParser,
} from "./utils";

type IInputPlayground = {
	input: PlaygroundInput;
	onInputChange: (input: PlaygroundInput) => void;
};

const Page = () => {
	const [query, setQuery] = useQueryState("data", playgroundParser);
	const playground = query ?? INITIAL_PLAYGROUND_QUERY;

	const handleInputChange = (input: PlaygroundInput) => {
		if (!playground.ui || !("input" in playground)) return;

		void setQuery({ ui: playground.ui, input } as PlaygroundQuery);
	};

	if (!playground.ui) return null;

	const PlaygroundUI = PLAYGROUND_UI[playground.ui].Component;
	const InputPlaygroundUI = PlaygroundUI as FC<IInputPlayground>;
	const StaticPlaygroundUI = PlaygroundUI as FC;
	const content =
		"input" in playground ? (
			<InputPlaygroundUI input={playground.input} onInputChange={handleInputChange} />
		) : (
			<StaticPlaygroundUI />
		);

	return (
		<main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
			<header className="mb-6">
				<h1 className="text-2xl font-semibold text-foreground">Playground</h1>
			</header>

			{content}
		</main>
	);
};

export default Page;
