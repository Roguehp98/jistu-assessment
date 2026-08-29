import type { LatLngTuple } from "leaflet";
import { useEffect } from "react";
import { useMap } from "react-leaflet";

type IViewport = {
	positions: LatLngTuple[];
	selectedPosition?: LatLngTuple;
};

const Viewport = ({ positions, selectedPosition }: IViewport) => {
	const map = useMap();

	useEffect(() => {
		if (selectedPosition) {
			map.flyTo(selectedPosition, Math.max(map.getZoom(), 14));
			return;
		}

		map.fitBounds(positions, { maxZoom: 14, padding: [24, 24] });
	}, [map, positions, selectedPosition]);

	return null;
};

export default Viewport;
