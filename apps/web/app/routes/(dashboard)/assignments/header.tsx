import { Button, Input, Select } from "antd";
import type { ChangeEventHandler, FC } from "react";

import type { ASSIGNMENT_STATUS } from "@repo/value";

import { ASSIGNMENT_STATUS_OPTIONS } from "./utils";

const CreateNewAssignment = lazy(() => import("./create-new-assignment"));

export type IHeader = {
	items: number;
	search: string;
	status: ASSIGNMENT_STATUS[];
	onCreated: () => void;
	onSearchChange: ChangeEventHandler<HTMLInputElement>;
	onStatusChange: (status: ASSIGNMENT_STATUS[]) => void;
};

const Header: FC<IHeader> = ({
	items,
	search,
	status,
	onCreated,
	onSearchChange,
	onStatusChange,
}) => {
	const [hasOpenedCreateModal, setHasOpenedCreateModal] = useState(false);
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

	const handleCreateOpen = () => {
		setHasOpenedCreateModal(true);
		setIsCreateModalOpen(true);
	};

	const handleCreateClose = () => {
		setIsCreateModalOpen(false);
	};

	return (
		<>
			<header className="mb-6">
				<h1 className="text-2xl font-semibold text-foreground">Assignments</h1>
				<p className="mt-1 text-sm text-muted">{items} total</p>
			</header>

			<div className="mb-4 flex w-full flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
				<div className="flex w-full flex-col gap-4 sm:flex-row sm:items-end">
					<div className="w-full sm:max-w-sm">
						<label htmlFor="assignment-search" hidden>
							Search assignments
						</label>
						<Input.Search
							allowClear
							id="assignment-search"
							name="search"
							placeholder="Search by label"
							value={search}
							onChange={onSearchChange}
						/>
					</div>

					<div className="w-full sm:w-72">
						<label htmlFor="assignment-status" hidden>
							Status
						</label>
						<Select<ASSIGNMENT_STATUS[]>
							allowClear
							id="assignment-status"
							className="w-full"
							mode="multiple"
							options={ASSIGNMENT_STATUS_OPTIONS}
							placeholder="All statuses"
							value={status}
							onChange={onStatusChange}
						/>
					</div>
				</div>

				<Button type="primary" onClick={handleCreateOpen}>
					Create assignment
				</Button>
			</div>

			{hasOpenedCreateModal && (
				<Suspense fallback={null}>
					<CreateNewAssignment
						open={isCreateModalOpen}
						onClose={handleCreateClose}
						onCreated={onCreated}
					/>
				</Suspense>
			)}
		</>
	);
};

export default Header;
