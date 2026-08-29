import { useQueryStates } from "nuqs";
import type { ComponentProps } from "react";

import { getManyShipments } from "@web/actions/dashboard/get-many-shipments";
import { ACTION_TAG } from "@web/libs/actions";
import { useEnhancedSWR } from "@web/libs/swr";

import Header, { type IHeader } from "./header";
import Pagination from "./pagination";
import Table from "./table";
import {
	getArrivalDateRange,
	getArrivalSortParam,
	getDateParam,
	getUtcDate,
	PAGE_SIZE_OPTIONS,
	parser,
	type ShipmentArrivalSort,
} from "./utils";

export { parser };

const ErrorMessage = () => (
	<p
		className="mb-4 border-l-4 border-danger-border bg-danger-surface px-4 py-3 text-sm text-danger-text"
		role="alert"
	>
		Unable to load shipments. Please try again.
	</p>
);

const Page = () => {
	const [{ arrivalFrom, arrivalSort, arrivalTo, page, perPage, search, status }, setQuery] =
		useQueryStates(parser);
	const normalizedPage = Math.max(1, page);
	const normalizedPerPage = PAGE_SIZE_OPTIONS.includes(perPage) ? perPage : 25;
	const arrivalFromParam = getDateParam(arrivalFrom);
	const arrivalToParam = getDateParam(arrivalTo);
	const arrivalDateRange = getArrivalDateRange(arrivalFrom, arrivalTo);
	const debouncedSearch = useDebounce(search.trim(), { wait: 300 });
	const {
		data: getManyShipmentsState,
		isLoading: isGetManyShipmentsLoading,
		isError: isGetManyShipmentsError,
		mutate,
	} = useEnhancedSWR(
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

	if (!getManyShipmentsState?.data) return null;

	if (isGetManyShipmentsError)
		return (
			<main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
				<ErrorMessage />
			</main>
		);

	const shipments = getManyShipmentsState.data.data;

	const handleSearchChange: IHeader["onSearchChange"] = (event) => {
		setQuery({ search: event.target.value, page: 1 });
	};

	const handlePageChange = (nextPage: number) => {
		setQuery({ page: nextPage });
	};

	const handleStatusChange: IHeader["onStatusChange"] = (nextStatus) => {
		setQuery({ status: nextStatus, page: 1 });
	};

	const handleArrivalRangeChange: IHeader["onArrivalRangeChange"] = (dates) => {
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

	const handleShipmentUpdated = async () => {
		await mutate();
	};

	const headerProps = {
		arrivalDateRange,
		items: shipments.items,
		search,
		status,
		onArrivalRangeChange: handleArrivalRangeChange,
		onSearchChange: handleSearchChange,
		onStatusChange: handleStatusChange,
	} satisfies IHeader;

	const tableProps = {
		arrivalSort,
		dataSource: shipments.data,
		emptyText: search ? "No matching shipments" : "No shipments",
		isLoading: isGetManyShipmentsLoading,
		onArrivalSortChange: handleArrivalSortChange,
		onUpdated: handleShipmentUpdated,
	} satisfies ComponentProps<typeof Table>;

	const paginationProps = {
		current: normalizedPage,
		pageSize: normalizedPerPage,
		total: shipments.items,
		onPageChange: handlePageChange,
		onPageSizeChange: handlePerPageChange,
	} satisfies ComponentProps<typeof Pagination>;

	return (
		<main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
			<Header {...headerProps} />

			<Table {...tableProps} />

			<Pagination {...paginationProps} />
		</main>
	);
};

export default Page;
