import { Input } from "antd";
import type { ComponentProps, FC } from "react";

import type { LocationMapPoint } from "@web/types/ui/location-map";
import LocationMap from "@web/ui/elements/location-map/wrapper";

const SHIPMENT_LOCATION_POINT_ID = "shipment-location";

export const COORDINATES_ERROR_MESSAGE =
	"Enter latitude and longitude separated by a comma within valid ranges";

type CoordinateValues = {
	lat: number;
	lng: number;
};

export const parseCoordinates = (value: string): CoordinateValues | null => {
	const parts = value.split(",").map((part) => part.trim());

	if (parts.length !== 2 || parts.some((part) => !part)) return null;

	const [lat, lng] = parts.map(Number);

	if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
	if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;

	return { lat, lng };
};

const CoordinatesInput: FC<ComponentProps<typeof Input>> = ({ value, ...props }) => {
	const coordinates = typeof value === "string" ? parseCoordinates(value) : null;
	const points: LocationMapPoint[] = coordinates
		? [
				{
					coordinate: [coordinates.lat, coordinates.lng],
					id: SHIPMENT_LOCATION_POINT_ID,
					title: "Shipment location",
				},
			]
		: [];

	return (
		<>
			<Input {...props} placeholder="32.7767, -96.7970" value={value} />

			<div className="mt-3">
				<LocationMap
					className="location-map--compact"
					emptyContent="Location preview unavailable"
					points={points}
					selectedPointId={SHIPMENT_LOCATION_POINT_ID}
				/>
			</div>
		</>
	);
};

export default CoordinatesInput;
