import dayjs, { type Dayjs } from "dayjs";
import {
	parseAsArrayOf,
	parseAsInteger,
	parseAsIsoDate,
	parseAsString,
	parseAsStringEnum,
} from "nuqs";

import { SHIPMENT_STATUS } from "@repo/value";
import type { ShipmentArrivalSortParam } from "@web/actions/dashboard/get-many-shipments";

export type ShipmentArrivalSort = "ascend" | "descend";

export const PAGE_SIZE_OPTIONS = [10, 25, 50];

const ARRIVAL_SORT_OPTIONS: ShipmentArrivalSort[] = ["ascend", "descend"];

export const SHIPMENT_STATUS_LABELS = {
	[SHIPMENT_STATUS.OPEN]: "Open",
	[SHIPMENT_STATUS.IN_TRANSIT]: "In transit",
	[SHIPMENT_STATUS.DELIVERED]: "Delivered",
};

export const SHIPMENT_STATUS_OPTIONS = Object.values(SHIPMENT_STATUS).map((value) => ({
	value,
	label: SHIPMENT_STATUS_LABELS[value],
}));

export const parser = {
	search: parseAsString.withDefault(""),
	status: parseAsArrayOf(
		parseAsStringEnum<SHIPMENT_STATUS>(Object.values(SHIPMENT_STATUS)),
	).withDefault([]),
	arrivalFrom: parseAsIsoDate,
	arrivalTo: parseAsIsoDate,
	arrivalSort: parseAsStringEnum<ShipmentArrivalSort>(ARRIVAL_SORT_OPTIONS),
	page: parseAsInteger.withDefault(1),
	perPage: parseAsInteger.withDefault(25),
};

export const getDateParam = (date: Date | null) => date?.toISOString().slice(0, 10) ?? "";

export const getArrivalDateRange = (
	arrivalFrom: Date | null,
	arrivalTo: Date | null,
): [Dayjs | null, Dayjs | null] | null => {
	if (!arrivalFrom && !arrivalTo) return null;

	return [
		arrivalFrom ? dayjs(getDateParam(arrivalFrom)) : null,
		arrivalTo ? dayjs(getDateParam(arrivalTo)) : null,
	];
};

export const getUtcDate = (date?: Dayjs | null) => {
	if (!date) return null;

	return new Date(`${date.format("YYYY-MM-DD")}T00:00:00.000Z`);
};

export const getArrivalSortParam = (
	arrivalSort: ShipmentArrivalSort | null,
): ShipmentArrivalSortParam | null => {
	if (arrivalSort === "ascend") return "arrival_date";
	if (arrivalSort === "descend") return "-arrival_date";

	return null;
};
