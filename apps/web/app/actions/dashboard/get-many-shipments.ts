import { array, type InferOutput, nullable, number, object } from "valibot";

import { type SHIPMENT_STATUS, ShipmentSchema } from "@repo/value";
import { type ACTION_TAG, INITIAL_ACTION_STATUS } from "@web/libs/actions";
import { fetchValidated } from "@web/libs/fetch";
import { ACTION_STATUS } from "@web/types/system";

export const GetManyShipmentsResponseSchema = object({
	first: number(),
	prev: nullable(number()),
	next: nullable(number()),
	last: number(),
	pages: number(),
	items: number(),
	data: array(ShipmentSchema),
});

type GetManyShipmentsResponse = InferOutput<typeof GetManyShipmentsResponseSchema>;
export type ShipmentArrivalSortParam = "arrival_date" | "-arrival_date";

type GetManyShipmentsQueryOptions = {
	arrivalFrom: string;
	arrivalSort: ShipmentArrivalSortParam | null;
	arrivalTo: string;
	page: number;
	perPage: number;
	search: string;
	status: SHIPMENT_STATUS[];
};

const initialGetManyShipmentsData: GetManyShipmentsResponse = {
	first: 0,
	prev: null,
	next: null,
	last: 0,
	pages: 0,
	items: 0,
	data: [],
};

export const initialGetManyShipmentsState = {
	...INITIAL_ACTION_STATUS,
	data: initialGetManyShipmentsData,
};

const getManyShipmentsQuery = ({
	arrivalFrom,
	arrivalSort,
	arrivalTo,
	page,
	perPage,
	search,
	status,
}: GetManyShipmentsQueryOptions) => {
	const trimmedSearch = search.trim();
	const query: Record<string, number | string> = {
		_page: page,
		_per_page: perPage,
		_sort: arrivalSort ?? "-update_at",
	};
	const where: Record<string, unknown> = {};

	if (status.length > 0) {
		where.status = { in: status };
	}

	if (trimmedSearch) {
		where.or = [
			{ label: { contains: trimmedSearch } },
			{ client_name: { contains: trimmedSearch } },
		];
	}

	if (arrivalFrom || arrivalTo) {
		where.arrival_date = {
			...(arrivalFrom && { gte: `${arrivalFrom}T00:00:00.000Z` }),
			...(arrivalTo && { lte: `${arrivalTo}T23:59:59.999Z` }),
		};
	}

	if (Object.keys(where).length > 0) {
		query._where = JSON.stringify(where);
	}

	return query;
};

export const getManyShipments = async ([
	,
	page = 1,
	perPage = 25,
	search = "",
	status = [],
	arrivalFrom = "",
	arrivalTo = "",
	arrivalSort = null,
]: [
	ACTION_TAG.GET_MANY_SHIPMENTS,
	number?,
	number?,
	string?,
	SHIPMENT_STATUS[]?,
	string?,
	string?,
	(ShipmentArrivalSortParam | null)?,
]) => {
	const query = getManyShipmentsQuery({
		arrivalFrom,
		arrivalSort,
		arrivalTo,
		page,
		perPage,
		search,
		status,
	});

	const data = await fetchValidated(GetManyShipmentsResponseSchema, "/shipments", { query });

	return {
		...INITIAL_ACTION_STATUS,
		status: ACTION_STATUS.SUCCESS, // temporary added status because `json-server` doesn't return status on result when failed
		data,
	};
};
