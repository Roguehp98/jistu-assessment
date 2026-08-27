export const COLOR_SCHEME_STORAGE_KEY = "color-scheme";

export type ColorScheme = "light" | "dark";

export const getSystemColorScheme = (): ColorScheme =>
	window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

export const getStoredColorScheme = (): ColorScheme | null => {
	try {
		const colorScheme = window.localStorage.getItem(COLOR_SCHEME_STORAGE_KEY);

		return colorScheme === "light" || colorScheme === "dark" ? colorScheme : null;
	} catch {
		return null;
	}
};

export const applyColorSchemePreference = (colorScheme: ColorScheme | null) => {
	const root = document.documentElement;
	const meta = document.querySelector<HTMLMetaElement>('meta[name="color-scheme"]');

	root.classList.toggle("light", colorScheme === "light");
	root.classList.toggle("dark", colorScheme === "dark");
	if (meta) meta.content = colorScheme ?? "light dark";

	try {
		if (colorScheme) {
			window.localStorage.setItem(COLOR_SCHEME_STORAGE_KEY, colorScheme);
		} else {
			window.localStorage.removeItem(COLOR_SCHEME_STORAGE_KEY);
		}
	} catch {
		/* Theme remains active when storage is unavailable. */
	}
};

export const COLOR_SCHEME_INIT_SCRIPT = `
try {
	const colorScheme = localStorage.getItem(${JSON.stringify(COLOR_SCHEME_STORAGE_KEY)});
	if (colorScheme === "light" || colorScheme === "dark") {
		document.documentElement.classList.add(colorScheme);
		document.querySelector('meta[name="color-scheme"]').content = colorScheme;
	}
} catch {}
`;
