import { useQueryStates } from "nuqs";
import type { ComponentProps } from "react";

import type { Assignment } from "@repo/value";
import { getManyAssignments } from "@web/actions/dashboard/get-many-assignments";
import { ACTION_TAG } from "@web/libs/actions";
import { useEnhancedSWR } from "@web/libs/swr";
import Pagination from "@web/ui/elements/pagination";

import AssignmentDetail from "./assignment-detail";
import Header, { type IHeader } from "./header";
import Table from "./table";
import { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS, parser } from "./utils";

export { parser };

const ErrorMessage = () => (
	<p
		className="mb-4 border-l-4 border-danger-border bg-danger-surface px-4 py-3 text-sm text-danger-text"
		role="alert"
	>
		Unable to load assignments. Please try again.
	</p>
);

const Page = () => {
	const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
	const [{ page, perPage, search, status }, setQuery] = useQueryStates(parser);
	const normalizedPage = Math.max(1, page);
	const normalizedPerPage = PAGE_SIZE_OPTIONS.includes(perPage) ? perPage : DEFAULT_PAGE_SIZE;
	const debouncedSearch = useDebounce(search.trim(), { wait: 300 });
	const {
		data: getManyAssignmentsState,
		isLoading: isGetManyAssignmentsLoading,
		isError: isGetManyAssignmentsError,
		mutate: mutateGetManyAssignments,
	} = useEnhancedSWR(
		[ACTION_TAG.GET_MANY_ASSIGNMENTS, normalizedPage, normalizedPerPage, debouncedSearch, status],
		getManyAssignments,
	);

	if (isGetManyAssignmentsError)
		return (
			<main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
				<ErrorMessage />
			</main>
		);

	if (!getManyAssignmentsState?.data) return null;

	const assignments = getManyAssignmentsState.data.data;

	const handleSearchChange: IHeader["onSearchChange"] = (event) => {
		setQuery({ search: event.target.value, page: 1 });
	};

	const handleStatusChange: IHeader["onStatusChange"] = (nextStatus) => {
		setQuery({ status: nextStatus, page: 1 });
	};

	const handlePageChange = (nextPage: number) => {
		setQuery({ page: nextPage });
	};

	const handlePerPageChange = (nextPerPage: number) => {
		setQuery({ perPage: nextPerPage, page: 1 });
	};

	const handleAssignmentSelect = (assignment: Assignment) => {
		setSelectedAssignment(assignment);
	};

	const handleDetailModalClose = () => {
		setSelectedAssignment(null);
	};

	const headerProps = {
		items: assignments.items,
		search,
		status,
		onCreated: mutateGetManyAssignments,
		onSearchChange: handleSearchChange,
		onStatusChange: handleStatusChange,
	} satisfies IHeader;

	const tableProps = {
		dataSource: assignments.data,
		emptyText: search || status.length > 0 ? "No matching assignments" : "No assignments",
		isLoading: isGetManyAssignmentsLoading,
		onSelect: handleAssignmentSelect,
	} satisfies ComponentProps<typeof Table>;

	const paginationProps = {
		current: normalizedPage,
		pageSize: normalizedPerPage,
		pageSizeId: "assignment-page-size",
		pageSizeOptions: PAGE_SIZE_OPTIONS,
		total: assignments.items,
		onPageChange: handlePageChange,
		onPageSizeChange: handlePerPageChange,
	} satisfies ComponentProps<typeof Pagination>;

	return (
		<main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
			<Header {...headerProps} />

			<Table {...tableProps} />

			<Pagination {...paginationProps} />

			<AssignmentDetail
				assignment={selectedAssignment}
				onClose={handleDetailModalClose}
				onDeleted={mutateGetManyAssignments}
			/>
		</main>
	);
};

export default Page;
