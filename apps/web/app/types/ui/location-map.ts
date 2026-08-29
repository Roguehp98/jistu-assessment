import type { ReactNode } from "react";

export type Coordinate = readonly [latitude: number, longitude: number];

export type LocationMapPoint = {
	coordinate: Coordinate;
	content?: ReactNode;
	id: string;
	title: string;
};

export type ILocationMap = {
	className?: string;
	emptyContent?: ReactNode;
	path?: readonly Coordinate[];
	points: readonly LocationMapPoint[];
	selectedPointId?: string | null;
	onPointSelect?: (pointId: string) => void;
};
