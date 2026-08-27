import { DatePicker, Input, Select } from "antd";
import { useQueryStates } from "nuqs";
import { is } from "valibot";

import {
	GetManyShipmentsResponseSchema,
	getManyShipments,
	initialGetManyShipmentsState,
} from "@web/actions/dashboard/get-many-shipments";
import { ACTION_TAG } from "@web/libs/actions";
import { useEnhancedSWR } from "@web/libs/swr";
import type { SHIPMENT_STATUS } from "@web/types/shipments";

import Pagination from "./pagination";
import Table from "./table";
import {
	getArrivalDateRange,
	getArrivalSortParam,
	getDateParam,
	getUtcDate,
	PAGE_SIZE_OPTIONS,
	parser,
	SHIPMENT_STATUS_OPTIONS,
	type ShipmentArrivalSort,
} from "./utils";

export { parser };

const { RangePicker } = DatePicker;

const useShipments = () => {
	const [{ arrivalFrom, arrivalSort, arrivalTo, page, perPage, search, status }, setQuery] =
		useQueryStates(parser);
	const normalizedPage = Math.max(1, page);
	const normalizedPerPage = PAGE_SIZE_OPTIONS.includes(perPage) ? perPage : 25;
	const arrivalFromParam = getDateParam(arrivalFrom);
	const arrivalToParam = getDateParam(arrivalTo);
	const arrivalDateRange = getArrivalDateRange(arrivalFrom, arrivalTo);
	const debouncedSearch = useDebounce(search.trim(), { wait: 300 });
	const { data, isLoading, isError } = useEnhancedSWR(
		[
			ACTION_TAG.GET_MANY_SHIPMENTS,
			normalizedPage,
			normalizedPerPage,
			debouncedSearch,
			status,
			arrivalFromParam,
			arrivalToParam,
			getArrivalSortParam(arrivalSort),
		],
		getManyShipments,
	);
	const response = is(GetManyShipmentsResponseSchema, data?.data)
		? data.data
		: initialGetManyShipmentsState.data;

	const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setQuery({ search: event.target.value, page: 1 });
	};

	const handlePageChange = (nextPage: number) => {
		setQuery({ page: nextPage });
	};

	const handleStatusChange = (nextStatus: SHIPMENT_STATUS[]) => {
		setQuery({ status: nextStatus, page: 1 });
	};

	const handleArrivalRangeChange: NonNullable<
		React.ComponentProps<typeof RangePicker>["onChange"]
	> = (dates) => {
		setQuery({
			arrivalFrom: getUtcDate(dates?.[0]),
			arrivalTo: getUtcDate(dates?.[1]),
			page: 1,
		});
	};

	const handlePerPageChange = (nextPerPage: number) => {
		setQuery({ perPage: nextPerPage, page: 1 });
	};

	const handleArrivalSortChange = (nextArrivalSort: ShipmentArrivalSort | null) => {
		setQuery({ arrivalSort: nextArrivalSort, page: 1 });
	};

	return {
		filters: {
			arrivalDateRange,
			handleArrivalRangeChange,
			handleSearchChange,
			handleStatusChange,
			search,
			status,
		},
		isError,
		items: response.items,
		paginationProps: {
			current: normalizedPage,
			pageSize: normalizedPerPage,
			total: response.items,
			onPageChange: handlePageChange,
			onPageSizeChange: handlePerPageChange,
		},
		tableProps: {
			arrivalSort,
			dataSource: response.data,
			emptyText: search ? "No matching shipments" : "No shipments",
			isLoading,
			onArrivalSortChange: handleArrivalSortChange,
		},
	};
};

const ErrorMessage = () => (
	<p
		className="mb-4 border-l-4 border-red-600 bg-red-50 px-4 py-3 text-sm text-red-900"
		role="alert"
	>
		Unable to load shipments. Please try again.
	</p>
);

const Page = () => {
	const { filters, isError, items, paginationProps, tableProps } = useShipments();

	return (
		<main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
			<header className="mb-6 flex items-end justify-between gap-4">
				<div>
					<h1 className="text-2xl font-semibold text-gray-950">Shipments</h1>
					<p className="mt-1 text-sm text-gray-600">{items} total</p>
				</div>
			</header>

			<div className="mb-4 flex w-full flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
				<div className="w-full sm:max-w-sm">
					<label className="mb-2 block text-sm font-medium text-gray-800" htmlFor="shipment-search">
						Search shipments
					</label>
					<Input.Search
						allowClear
						id="shipment-search"
						name="search"
						placeholder="Label or client name"
						value={filters.search}
						onChange={filters.handleSearchChange}
					/>
				</div>

				<div className="w-full sm:w-72">
					<label className="mb-2 block text-sm font-medium text-gray-800" htmlFor="shipment-status">
						Status
					</label>
					<Select<SHIPMENT_STATUS[]>
						allowClear
						id="shipment-status"
						className="w-full"
						mode="multiple"
						options={SHIPMENT_STATUS_OPTIONS}
						placeholder="All statuses"
						value={filters.status}
						onChange={filters.handleStatusChange}
					/>
				</div>

				<div className="w-full sm:w-80">
					<label
						className="mb-2 block text-sm font-medium text-gray-800"
						htmlFor="shipment-arrival-date"
					>
						Arrival date
					</label>
					<RangePicker
						allowClear
						id="shipment-arrival-date"
						className="w-full"
						format="MMM D, YYYY"
						value={filters.arrivalDateRange}
						onChange={filters.handleArrivalRangeChange}
					/>
				</div>
			</div>

			{isError && <ErrorMessage />}

			<Table {...tableProps} />

			<Pagination {...paginationProps} />
		</main>
	);
};

export default Page;
