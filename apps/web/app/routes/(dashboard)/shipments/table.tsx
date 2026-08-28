import { Table as AntTable, type TableProps, Tag } from "antd";
import { type FC, useState } from "react";

import { SHIPMENT_STATUS, type Shipment } from "@web/types/shipments";

import Drawer from "./drawer";
import { SHIPMENT_STATUS_LABELS, type ShipmentArrivalSort } from "./utils";

const STATUS_COLORS = {
	[SHIPMENT_STATUS.OPEN]: "gold",
	[SHIPMENT_STATUS.IN_TRANSIT]: "cyan",
	[SHIPMENT_STATUS.DELIVERED]: "green",
};

const dateFormatter = new Intl.DateTimeFormat("en", {
	dateStyle: "medium",
	timeStyle: "short",
});

type IShipmentsTable = {
	arrivalSort: ShipmentArrivalSort | null;
	dataSource: Shipment[];
	emptyText: string;
	isLoading: boolean;
	onArrivalSortChange: (arrivalSort: ShipmentArrivalSort | null) => void;
	onUpdated: () => Promise<void>;
};

const getColumns = (arrivalSort: ShipmentArrivalSort | null): TableProps<Shipment>["columns"] => [
	{
		title: "Client",
		dataIndex: "client_name",
		width: 220,
	},
	{
		title: "Status",
		dataIndex: "status",
		width: 160,
		render: (status: SHIPMENT_STATUS) => (
			<Tag color={STATUS_COLORS[status]}>{SHIPMENT_STATUS_LABELS[status]}</Tag>
		),
	},
	{
		title: "Label",
		dataIndex: "label",
		width: 220,
	},
	{
		title: "Arrival date",
		dataIndex: "arrival_date",
		width: 220,
		render: (arrivalDate: string) => dateFormatter.format(new Date(arrivalDate)),
		sorter: true,
		sortOrder: arrivalSort,
	},
];

const Table: FC<IShipmentsTable> = ({
	arrivalSort,
	dataSource,
	emptyText,
	isLoading,
	onArrivalSortChange,
	onUpdated,
}) => {
	const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);

	const handleChange: NonNullable<TableProps<Shipment>["onChange"]> = (_, __, sorter) => {
		const arrivalSorter = Array.isArray(sorter) ? sorter[0] : sorter;

		onArrivalSortChange(arrivalSorter.order ?? null);
	};

	const handleClose = () => {
		setSelectedShipment(null);
	};

	const handleRowClick = (shipment: Shipment) => {
		setSelectedShipment(shipment);
	};

	const getRowProps: NonNullable<TableProps<Shipment>["onRow"]> = (shipment) => ({
		"aria-label": `View shipment ${shipment.label}`,
		className:
			"cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-blue-600",
		tabIndex: 0,
		onClick: () => handleRowClick(shipment),
		onKeyDown: (event) => {
			if (!["Enter", " "].includes(event.key)) return;

			event.preventDefault();
			handleRowClick(shipment);
		},
	});

	return (
		<>
			<AntTable<Shipment>
				bordered
				caption={<span className="sr-only">Shipments</span>}
				columns={getColumns(arrivalSort)}
				dataSource={dataSource}
				loading={isLoading}
				locale={{ emptyText }}
				pagination={false}
				rowKey="id"
				scroll={{ x: 820 }}
				size="middle"
				onChange={handleChange}
				onRow={getRowProps}
			/>

			<Drawer shipment={selectedShipment} onClose={handleClose} onUpdated={onUpdated} />
		</>
	);
};

export default Table;
