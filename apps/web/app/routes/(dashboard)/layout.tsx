import { DASHBOARD_ROUTES } from "@web/libs/route";
import ColorSchemeSwitch from "@web/ui/elements/color-scheme/switch";

const navigationItems = [
	{ label: "Assignments", path: DASHBOARD_ROUTES.ASSIGNMENTS.path },
	{ label: "Shipments", path: DASHBOARD_ROUTES.SHIPMENTS.path },
];

const StandaloneLayout = () => {
	return (
		<div className="min-h-screen">
			<header className="border-b border-muted/20">
				<div className="flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8">
					<nav aria-label="Dashboard" className="flex h-full items-center">
						{navigationItems.map(({ label, path }) => (
							<NavLink
								key={path}
								className={({ isActive }) =>
									cn(
										"inline-flex h-full items-center border-b-2 border-transparent px-4 text-sm font-medium text-muted transition-colors hover:text-foreground",
										isActive && "border-blue-600 text-foreground",
									)
								}
								to={path}
							>
								{label}
							</NavLink>
						))}
					</nav>

					<ColorSchemeSwitch />
				</div>
			</header>

			<Outlet />
		</div>
	);
};

export default StandaloneLayout;
