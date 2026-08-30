type CoordinatePoint = {
	lat: number;
	lng: number;
};

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

const getAngularDistance = (left: CoordinatePoint, right: CoordinatePoint) => {
	const leftLatitude = toRadians(left.lat);
	const rightLatitude = toRadians(right.lat);
	const latitudeDelta = rightLatitude - leftLatitude;
	const longitudeDelta = toRadians(right.lng - left.lng);
	const latitudeHalfChord = Math.sin(latitudeDelta / 2);
	const longitudeHalfChord = Math.sin(longitudeDelta / 2);
	const halfChord =
		latitudeHalfChord * latitudeHalfChord +
		Math.cos(leftLatitude) * Math.cos(rightLatitude) * longitudeHalfChord * longitudeHalfChord;
	const normalizedHalfChord = Math.min(1, Math.max(0, halfChord));

	return 2 * Math.atan2(Math.sqrt(normalizedHalfChord), Math.sqrt(1 - normalizedHalfChord));
};

export const sortByNearestNeighbor = <Point extends CoordinatePoint>(points: readonly Point[]) => {
	if (points.length < 2) return [...points];

	const remaining = points.slice(1);
	const sorted = [points[0]];

	while (remaining.length > 0) {
		const current = sorted.at(-1)!;
		let nearestIndex = 0;
		let nearestDistance = getAngularDistance(current, remaining[0]);

		for (let index = 1; index < remaining.length; index += 1) {
			const distance = getAngularDistance(current, remaining[index]);

			if (distance < nearestDistance) {
				nearestDistance = distance;
				nearestIndex = index;
			}
		}

		const [nearest] = remaining.splice(nearestIndex, 1);
		sorted.push(nearest);
	}

	return sorted;
};
