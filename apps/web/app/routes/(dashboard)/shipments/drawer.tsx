import { Drawer as AntDrawer, Button, Form, Input, Select } from "antd";
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

type ShipmentFormValues = {
	assignment_id: string;
	arrival_date: string;
	client_name: string;
	delivery_by_date: string;
	lat: string;
	lng: string;
	status: Shipment["status"];
	warehouse_id: string;
};

const getFormValues = (shipment: Shipment): ShipmentFormValues => ({
	assignment_id: shipment.assignment_id ?? "Unassigned",
	arrival_date: dateFormatter.format(new Date(shipment.arrival_date)),
	client_name: shipment.client_name,
	delivery_by_date: shipment.delivery_by_date,
	lat: String(shipment.lat),
	lng: String(shipment.lng),
	status: shipment.status,
	warehouse_id: shipment.warehouse_id,
});

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
		size="min(480px, 100vw)"
		onClose={onClose}
	>
		{shipment && (
			<Form
				key={shipment.id}
				initialValues={getFormValues(shipment)}
				layout="vertical"
				preserve={false}
			>
				<Form.Item label="Client name" name="client_name">
					<Input disabled />
				</Form.Item>

				<Form.Item label="Status" name="status">
					<Select disabled options={SHIPMENT_STATUS_OPTIONS} />
				</Form.Item>

				<Form.Item label="Arrival date" name="arrival_date">
					<Input disabled />
				</Form.Item>

				<Form.Item label="Delivery by date" name="delivery_by_date">
					<Input />
				</Form.Item>

				<Form.Item label="Warehouse ID" name="warehouse_id">
					<Input disabled />
				</Form.Item>

				<Form.Item label="Assignment ID" name="assignment_id">
					<Input disabled />
				</Form.Item>

				<div className="grid grid-cols-2 gap-4">
					<Form.Item className="mb-0" label="Latitude" name="lat">
						<Input inputMode="decimal" step="any" type="number" />
					</Form.Item>

					<Form.Item className="mb-0" label="Longitude" name="lng">
						<Input inputMode="decimal" step="any" type="number" />
					</Form.Item>
				</div>
			</Form>
		)}
	</AntDrawer>
);

export default Drawer;
