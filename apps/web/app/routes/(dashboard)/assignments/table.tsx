import { Table as AntTable, type TableProps, Tag } from "antd";
import type { FC } from "react";

import { ASSIGNMENT_STATUS, type Assignment } from "@repo/value";

const STATUS_COLORS = {
	[ASSIGNMENT_STATUS.OPEN]: "gold",
	[ASSIGNMENT_STATUS.COMPLETED]: "green",
};

const STATUS_LABELS = {
	[ASSIGNMENT_STATUS.OPEN]: "Open",
	[ASSIGNMENT_STATUS.COMPLETED]: "Completed",
};

const columns: TableProps<Assignment>["columns"] = [
	{
		title: "Label",
		dataIndex: "label",
		width: 280,
	},
	{
		title: "Status",
		dataIndex: "status",
		width: 180,
		render: (status: ASSIGNMENT_STATUS) => (
			<Tag color={STATUS_COLORS[status]}>{STATUS_LABELS[status]}</Tag>
		),
	},
	{
		title: "Shipments",
		dataIndex: "shipment_count",
		width: 160,
	},
];

type IAssignmentsTable = {
	dataSource: Assignment[];
	emptyText: string;
	isLoading: boolean;
	onSelect: (assignment: Assignment) => void;
};

const Table: FC<IAssignmentsTable> = ({ dataSource, emptyText, isLoading, onSelect }) => (
	<AntTable<Assignment>
		bordered
		caption={<span className="sr-only">Assignments</span>}
		columns={columns}
		dataSource={dataSource}
		loading={isLoading}
		locale={{ emptyText }}
		pagination={false}
		rowKey="id"
		scroll={{ x: 620 }}
		size="middle"
		onRow={(assignment) => ({
			"aria-label": `View assignment ${assignment.label}`,
			className: "cursor-pointer",
			tabIndex: 0,
			onClick: () => onSelect(assignment),
			onKeyDown: (event) => {
				if (event.key !== "Enter" && event.key !== " ") return;

				event.preventDefault();
				onSelect(assignment);
			},
		})}
	/>
);

export default Table;
