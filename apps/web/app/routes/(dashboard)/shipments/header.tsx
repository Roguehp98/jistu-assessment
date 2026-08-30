import { Button, DatePicker, Input, Select } from "antd";
import type { ChangeEventHandler, ComponentProps, FC } from "react";

import type { SHIPMENT_STATUS } from "@repo/value";

import { SHIPMENT_STATUS_OPTIONS } from "./utils";

const { RangePicker } = DatePicker;

export type IHeader = {
	arrivalDateRange: ComponentProps<typeof RangePicker>["value"];
	items: number;
	search: string;
	status: SHIPMENT_STATUS[];
	onArrivalRangeChange: NonNullable<ComponentProps<typeof RangePicker>["onChange"]>;
	onCreate: () => void;
	onSearchChange: ChangeEventHandler<HTMLInputElement>;
	onStatusChange: (status: SHIPMENT_STATUS[]) => void;
};

const Header: FC<IHeader> = ({
	arrivalDateRange,
	items,
	search,
	status,
	onArrivalRangeChange,
	onCreate,
	onSearchChange,
	onStatusChange,
}) => (
	<>
		<header className="mb-6">
			<h1 className="text-2xl font-semibold text-foreground">Shipments</h1>
			<p className="mt-1 text-sm text-muted">{items} total</p>
		</header>

		<div className="mb-4 flex w-full flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
			<div className="flex flex-1 flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
				<div className="w-full sm:w-64">
					<label className="mb-2 block text-sm font-medium text-label" htmlFor="shipment-search">
						Search shipments
					</label>
					<Input.Search
						allowClear
						id="shipment-search"
						name="search"
						placeholder="Label or client name"
						value={search}
						onChange={onSearchChange}
					/>
				</div>

				<div className="w-full sm:w-64">
					<label className="mb-2 block text-sm font-medium text-label" htmlFor="shipment-status">
						Status
					</label>
					<Select<SHIPMENT_STATUS[]>
						allowClear
						id="shipment-status"
						className="w-full"
						mode="multiple"
						options={SHIPMENT_STATUS_OPTIONS}
						placeholder="All statuses"
						value={status}
						onChange={onStatusChange}
					/>
				</div>

				<div className="w-full sm:w-72">
					<label
						className="mb-2 block text-sm font-medium text-label"
						htmlFor="shipment-arrival-date"
					>
						Arrival date
					</label>
					<RangePicker
						allowClear
						id="shipment-arrival-date"
						className="w-full"
						format="MMM D, YYYY"
						value={arrivalDateRange}
						onChange={onArrivalRangeChange}
					/>
				</div>
			</div>

			<Button className="shrink-0" type="primary" onClick={onCreate}>
				Create
			</Button>
		</div>
	</>
);

export default Header;
