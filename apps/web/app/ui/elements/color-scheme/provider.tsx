import { ConfigProvider, theme } from "antd";
import { createContext, type FC, useContext, useMemo, useState } from "react";

import {
	applyColorSchemePreference,
	type ColorScheme,
	getStoredColorScheme,
	getSystemColorScheme,
} from "@web/libs/color-scheme";

type IColorSchemeContext = {
	colorScheme: ColorScheme;
	toggleColorScheme: () => void;
};

type IColorSchemeProvider = {
	children: React.ReactNode;
};

const ColorSchemeContext = createContext<IColorSchemeContext | null>(null);

const ColorSchemeProvider: FC<IColorSchemeProvider> = ({ children }) => {
	const [colorScheme, setColorScheme] = useState<ColorScheme>("light");

	useEffect(() => {
		const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
		const syncColorScheme = () => {
			setColorScheme(getStoredColorScheme() ?? getSystemColorScheme());
		};

		syncColorScheme();
		mediaQuery.addEventListener("change", syncColorScheme);

		return () => mediaQuery.removeEventListener("change", syncColorScheme);
	}, []);

	const contextValue = useMemo<IColorSchemeContext>(
		() => ({
			colorScheme,
			toggleColorScheme: () => {
				const nextColorScheme = colorScheme === "dark" ? "light" : "dark";
				const preference = nextColorScheme === getSystemColorScheme() ? null : nextColorScheme;

				applyColorSchemePreference(preference);
				setColorScheme(nextColorScheme);
			},
		}),
		[colorScheme],
	);

	return (
		<ColorSchemeContext value={contextValue}>
			<ConfigProvider
				theme={{
					algorithm: colorScheme === "dark" ? theme.darkAlgorithm : theme.defaultAlgorithm,
				}}
			>
				{children}
			</ConfigProvider>
		</ColorSchemeContext>
	);
};

export const useColorScheme = () => {
	const context = useContext(ColorSchemeContext);

	if (!context) throw new Error("useColorScheme must be used within ColorSchemeProvider");

	return context;
};

export default ColorSchemeProvider;
