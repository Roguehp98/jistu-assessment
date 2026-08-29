import { divIcon, type LatLngTuple } from "leaflet";
import { type FC, useMemo } from "react";
import { MapContainer, Marker, Polyline, Popup, TileLayer } from "react-leaflet";

import type { Coordinate, ILocationMap } from "@web/types/ui/location-map";

import Viewport from "./viewport";

const markerIcon = divIcon({
	className: "location-map__marker",
	html: '<span class="location-map__pin"><span></span></span>',
	iconAnchor: [14, 34],
	iconSize: [28, 36],
	popupAnchor: [0, -32],
});

const selectedMarkerIcon = divIcon({
	className: "location-map__marker",
	html: '<span class="location-map__pin location-map__pin--selected"><span></span></span>',
	iconAnchor: [17, 41],
	iconSize: [34, 43],
	popupAnchor: [0, -39],
});

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

			{points.map(({ coordinate, content, id, title }) => {
				const isSelected = id === selectedPointId;

				return (
					<Marker
						key={id}
						alt={title}
						icon={isSelected ? selectedMarkerIcon : markerIcon}
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
