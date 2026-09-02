import { describe, expect, it } from "vitest";

import { sortByNearestNeighbor } from "./nearest-neighbor-algo";

/* Access /playground?data={"ui":"location-map"} route on development to check it manually */
describe("sortByNearestNeighbor", () => {
	it("returns a new array for empty and single-point inputs", () => {
		const empty: Array<{ lat: number; lng: number }> = [];
		const single = [{ id: "only", lat: 10.7725, lng: 106.698 }];

		const emptyResult = sortByNearestNeighbor(empty);
		const singleResult = sortByNearestNeighbor(single);

		expect(emptyResult).toEqual([]);
		expect(emptyResult).not.toBe(empty);
		expect(singleResult).toEqual(single);
		expect(singleResult).not.toBe(single);
	});

	it("recalculates the nearest point from the last selected point", () => {
		const points = [
			{ id: "start", lat: 10.7725, lng: 106.698 },
			{ id: "west", lat: 10.7725, lng: 106.6945 },
			{ id: "north", lat: 10.7769, lng: 106.7009 },
			{ id: "east", lat: 10.7733, lng: 106.7005 },
		] as const;

		const result = sortByNearestNeighbor(points);

		expect(result.map(({ id }) => id)).toEqual(["start", "east", "north", "west"]);
	});

	it("does not mutate the input array", () => {
		const points = [
			{ id: "start", lat: 10.7725, lng: 106.698 },
			{ id: "west", lat: 10.7725, lng: 106.6945 },
			{ id: "east", lat: 10.7733, lng: 106.7005 },
		];
		const originalOrder = [...points];

		const result = sortByNearestNeighbor(points);

		expect(points).toEqual(originalOrder);
		expect(result).not.toBe(points);
	});

	it("keeps input order when candidates are equally distant", () => {
		const points = [
			{ id: "start", lat: 10, lng: 106 },
			{ id: "west", lat: 10, lng: 105.999 },
			{ id: "east", lat: 10, lng: 106.001 },
		] as const;

		const result = sortByNearestNeighbor(points);

		expect(result.map(({ id }) => id)).toEqual(["start", "west", "east"]);
	});
});
