import { defineConfig, mergeConfig } from "vitest/config";

import viteConfig from "./vite.config.ts";

export default defineConfig((config) =>
	mergeConfig(
		viteConfig(config),
		defineConfig({
			test: {
				globals: true,
				environment: "happy-dom",
			},
		}),
	),
);
