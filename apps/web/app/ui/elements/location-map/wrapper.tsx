import { type FC, lazy, Suspense, useEffect, useState } from "react";

import type { ILocationMap } from "@web/types/ui/location-map";
import "@web/styles/location-map.css";

const LocationMapClient = lazy(() => import("./map.client"));

const LocationMapPlaceholder: FC<Pick<ILocationMap, "className">> = ({ className }) => (
	<div aria-busy="true" className={cn("location-map location-map--placeholder", className)} />
);

const LocationMap: FC<ILocationMap> = ({ emptyContent = "No locations available", ...props }) => {
	const [isMounted, setIsMounted] = useState(false);

	useEffect(() => {
		setIsMounted(true);
	}, []);

	if (props.points.length === 0) {
		return (
			<div className={cn("location-map location-map--empty", props.className)}>{emptyContent}</div>
		);
	}

	if (!isMounted) return <LocationMapPlaceholder className={props.className} />;

	return (
		<Suspense fallback={<LocationMapPlaceholder className={props.className} />}>
			<LocationMapClient {...props} />
		</Suspense>
	);
};

export default LocationMap;
