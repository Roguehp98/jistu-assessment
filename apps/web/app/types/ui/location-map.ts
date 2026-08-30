import type { ReactNode } from "react";

export type Coordinate = readonly [latitude: number, longitude: number];
export type LocationMapPointVariant = "info" | "success";

export type LocationMapPoint = {
	coordinate: Coordinate;
	content?: ReactNode;
	id: string;
	title: string;
	variant?: LocationMapPointVariant;
};

export type ILocationMap = {
	className?: string;
	emptyContent?: ReactNode;
	path?: readonly Coordinate[];
	points: readonly LocationMapPoint[];
	selectedPointId?: string | null;
	onPointSelect?: (pointId: string) => void;
};
