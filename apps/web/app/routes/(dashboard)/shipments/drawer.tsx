import { Drawer as AntDrawer, Button, Input, Select } from "antd";
import type { FC } from "react";

import type { Shipment } from "@web/types/shipments";

import { SHIPMENT_STATUS_OPTIONS } from "./utils";

const dateFormatter = new Intl.DateTimeFormat("en", {
	dateStyle: "medium",
	timeStyle: "short",
});

type IDrawer = {
	shipment: Shipment | null;
	onClose: () => void;
};

const Drawer: FC<IDrawer> = ({ shipment, onClose }) => (
	<AntDrawer
		destroyOnHidden
		footer={
			<div className="flex justify-end gap-2">
				<Button onClick={onClose}>Cancel</Button>
				<Button disabled type="primary">
					Save
				</Button>
			</div>
		}
		open={shipment !== null}
		title={shipment ? `Shipment ${shipment.label}` : "Shipment details"}
		width="min(480px, 100vw)"
		onClose={onClose}
	>
		<div className="grid gap-4">
			<div>
				<label className="mb-2 block text-sm font-medium text-gray-800" htmlFor="client-name">
					Client name
				</label>
				<Input id="client-name" readOnly value={shipment?.client_name ?? ""} />
			</div>

			<div>
				<label className="mb-2 block text-sm font-medium text-gray-800" htmlFor="status">
					Status
				</label>
				<Select
					disabled
					id="status"
					className="w-full"
					options={SHIPMENT_STATUS_OPTIONS}
					value={shipment?.status}
				/>
			</div>

			<div>
				<label className="mb-2 block text-sm font-medium text-gray-800" htmlFor="arrival-date">
					Arrival date
				</label>
				<Input
					id="arrival-date"
					readOnly
					value={shipment ? dateFormatter.format(new Date(shipment.arrival_date)) : ""}
				/>
			</div>

			<div>
				<label className="mb-2 block text-sm font-medium text-gray-800" htmlFor="delivery-by-date">
					Delivery by date
				</label>
				<Input
					id="delivery-by-date"
					readOnly
					value={shipment ? dateFormatter.format(new Date(shipment.delivery_by_date)) : ""}
				/>
			</div>

			<div>
				<label className="mb-2 block text-sm font-medium text-gray-800" htmlFor="warehouse-id">
					Warehouse ID
				</label>
				<Input id="warehouse-id" readOnly value={shipment?.warehouse_id ?? ""} />
			</div>

			<div>
				<label className="mb-2 block text-sm font-medium text-gray-800" htmlFor="assignment-id">
					Assignment ID
				</label>
				<Input id="assignment-id" readOnly value={shipment?.assignment_id ?? "Unassigned"} />
			</div>
		</div>
	</AntDrawer>
);

export default Drawer;
