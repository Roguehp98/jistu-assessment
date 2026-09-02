import { index, layout, type RouteConfig, route } from "@react-router/dev/routes";

import { DASHBOARD_ROUTES, DEVELOPMENT_ROUTES } from "./libs/route";

const routes = [
	/* DASHBOARD */
	layout("routes/(dashboard)/layout.tsx", [
		index("routes/(dashboard)/(home)/page.tsx"),
		route(DASHBOARD_ROUTES.ASSIGNMENTS.path, "routes/(dashboard)/assignments/page.tsx"),
		route(DASHBOARD_ROUTES.SHIPMENTS.path, "routes/(dashboard)/shipments/page.tsx"),
	]),
];

if (process.env.NODE_ENV === "development") {
	routes.push(route("/.well-known/appspecific/com.chrome.devtools.json", "routes/debug-null.tsx"));
	routes.push(route(DEVELOPMENT_ROUTES.PLAYGROUND.path, "routes/(playground)/page.tsx"));
}

export default routes satisfies RouteConfig;
