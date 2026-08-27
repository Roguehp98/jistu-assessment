import { layout, type RouteConfig, route } from "@react-router/dev/routes";

import { DASHBOARD_ROUTES } from "./libs/route";

const routes = [
	/* DASHBOARD */
	layout("routes/(dashboard)/layout.tsx", [
		route(DASHBOARD_ROUTES.SHIPMENTS.path, "routes/(dashboard)/shipments/page.tsx"),
	]),
];

if (process.env.NODE_ENV === "development") {
	routes.push(route("/.well-known/appspecific/com.chrome.devtools.json", "routes/debug-null.tsx"));
}

export default routes satisfies RouteConfig;
