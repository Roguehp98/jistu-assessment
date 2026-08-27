import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import * as esToolkitImports from "es-toolkit";
import * as reactRouterImports from "react-router";
import type { Options as AutoImportOptions } from "unplugin-auto-import/types";
import AutoImport from "unplugin-auto-import/vite";
import { defineConfig } from "vite";
import babel from "vite-plugin-babel";

const AUTO_IMPORT_THIRD_PARTY_CONFIG = {
	"react-router": [
		...Object.keys(reactRouterImports).filter((key) => key.startsWith("use")),
		"Outlet",
		"Link",
		"NavLink",
	],
	"@web/libs/cn": ["cn"],
	"es-toolkit": Object.keys(esToolkitImports),
};

const AUTO_IMPORT_CONFIG: AutoImportOptions = {
	imports: ["react", "ahooks", AUTO_IMPORT_THIRD_PARTY_CONFIG],
	dts: "./auto-imports.d.ts",
	defaultExportByFilename: true,
};

export default defineConfig({
	server: { port: 3000 },
	plugins: [
		tailwindcss(),
		reactRouter(),
		babel({
			exclude: /node_modules/,
			include: /apps[\\/]web[\\/]app[\\/].*\.[jt]sx?$/,
			babelConfig: {
				presets: ["@babel/preset-typescript"],
				plugins: ["babel-plugin-react-compiler"],
			},
		}),
		AutoImport(AUTO_IMPORT_CONFIG),
	],
	resolve: {
		tsconfigPaths: true,
	},
});
