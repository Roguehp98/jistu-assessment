import { DASHBOARD_ROUTES } from "@web/libs/route";

import type { Route } from "./+types/layout";
import Header from "./header";

export const meta: Route.MetaFunction = ({ location }) => {
	const route = Object.values(DASHBOARD_ROUTES).find(
		({ path }) => location.pathname === path || location.pathname.startsWith(`${path}/`),
	);

	return route ? [{ title: route.label }] : [];
};

const StandaloneLayout = () => {
	return (
		<div className="min-h-screen">
			<Header />

			<Outlet />
		</div>
	);
};

export default StandaloneLayout;
