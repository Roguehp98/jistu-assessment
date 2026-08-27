import { Switch } from "antd";

import { useColorScheme } from "./provider";

const ColorSchemeSwitch = () => {
	const { colorScheme, toggleColorScheme } = useColorScheme();

	return (
		<div className="flex shrink-0 items-center gap-2">
			<label className="text-sm font-medium text-label" htmlFor="color-scheme">
				Dark mode
			</label>
			<Switch
				id="color-scheme"
				aria-label="Dark mode"
				checked={colorScheme === "dark"}
				onChange={toggleColorScheme}
			/>
		</div>
	);
};

export default ColorSchemeSwitch;
