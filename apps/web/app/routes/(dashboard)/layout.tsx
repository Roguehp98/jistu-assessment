import ColorSchemeSwitch from "@web/ui/elements/color-scheme/switch";

const StandaloneLayout = () => {
	return (
		<div className="relative min-h-screen">
			<div className="absolute right-4 top-8 z-10 sm:right-6 lg:right-8">
				<ColorSchemeSwitch />
			</div>

			<Outlet />
		</div>
	);
};

export default StandaloneLayout;
