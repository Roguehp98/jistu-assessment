import { divIcon, type LatLngTuple } from "leaflet";
import { type FC, useMemo } from "react";
import { MapContainer, Marker, Polyline, Popup, TileLayer } from "react-leaflet";

import type { Coordinate, ILocationMap, LocationMapPointVariant } from "@web/types/ui/location-map";

import Viewport from "./viewport";

const createMarkerIcon = (variant: LocationMapPointVariant, isSelected: boolean) =>
	divIcon({
		className: "location-map__marker",
		html: `<span class="location-map__pin location-map__pin--${variant}${isSelected ? " location-map__pin--selected" : ""}"><span></span></span>`,
		iconAnchor: isSelected ? [17, 41] : [14, 34],
		iconSize: isSelected ? [34, 43] : [28, 36],
		popupAnchor: isSelected ? [0, -39] : [0, -32],
	});

const markerIcons = {
	info: {
		default: createMarkerIcon("info", false),
		selected: createMarkerIcon("info", true),
	},
	success: {
		default: createMarkerIcon("success", false),
		selected: createMarkerIcon("success", true),
	},
};

const toLatLngTuple = ([latitude, longitude]: Coordinate): LatLngTuple => [latitude, longitude];

const MapClient: FC<ILocationMap> = ({
	className,
	path = [],
	points,
	selectedPointId,
	onPointSelect,
}) => {
	const positions = useMemo(
		() => points.map(({ coordinate }) => toLatLngTuple(coordinate)),
		[points],
	);
	const pathPositions = useMemo(() => path.map(toLatLngTuple), [path]);
	const selectedPosition = useMemo(() => {
		const coordinate = points.find(({ id }) => id === selectedPointId)?.coordinate;

		return coordinate ? toLatLngTuple(coordinate) : undefined;
	}, [points, selectedPointId]);

	return (
		<MapContainer
			center={positions[0]}
			className={cn("location-map", className)}
			scrollWheelZoom
			zoom={13}
		>
			<TileLayer
				attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
				maxZoom={19}
				url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
			/>

			{pathPositions.length > 1 && (
				<Polyline pathOptions={{ color: "#2563eb", weight: 4 }} positions={pathPositions} />
			)}

			{points.map(({ coordinate, content, id, title, variant = "info" }) => {
				const isSelected = id === selectedPointId;

				return (
					<Marker
						key={id}
						alt={title}
						icon={markerIcons[variant][isSelected ? "selected" : "default"]}
						position={toLatLngTuple(coordinate)}
						title={title}
						zIndexOffset={isSelected ? 1_000 : 0}
						eventHandlers={{ click: () => onPointSelect?.(id) }}
					>
						<Popup>{content ?? title}</Popup>
					</Marker>
				);
			})}

			<Viewport positions={positions} selectedPosition={selectedPosition} />
		</MapContainer>
	);
};

export default MapClient;
