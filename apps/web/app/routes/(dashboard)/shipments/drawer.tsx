import { Alert, Drawer as AntDrawer, Button, Form, Input, Select } from "antd";
import type { FC } from "react";

import { updateShipment } from "@web/actions/dashboard/update-shipment";
import { ACTION_TAG } from "@web/libs/actions";
import { useEnhancedSWRMutation } from "@web/libs/swr";
import type { Shipment } from "@web/types/shipments";
import { ACTION_STATUS } from "@web/types/system";

import { SHIPMENT_STATUS_OPTIONS } from "./utils";

const dateFormatter = new Intl.DateTimeFormat("en", {
	dateStyle: "medium",
	timeStyle: "short",
});
const UPDATE_SHIPMENT_KEY: [ACTION_TAG.UPDATE_SHIPMENT] = [ACTION_TAG.UPDATE_SHIPMENT];

type IDrawer = {
	shipment: Shipment | null;
	onClose: () => void;
	onUpdated: () => Promise<void>;
};

type ShipmentFormValues = {
	assignment_id?: string | null;
	arrival_date: string;
	client_name: string;
	delivery_by_date: string;
	lat: string;
	lng: string;
	status: Shipment["status"];
	warehouse_id: string;
};

const getFormValues = (shipment: Shipment): ShipmentFormValues => ({
	assignment_id: shipment.assignment_id,
	arrival_date: dateFormatter.format(new Date(shipment.arrival_date)),
	client_name: shipment.client_name,
	delivery_by_date: shipment.delivery_by_date,
	lat: String(shipment.lat),
	lng: String(shipment.lng),
	status: shipment.status,
	warehouse_id: shipment.warehouse_id,
});

const Drawer: FC<IDrawer> = ({ shipment, onClose, onUpdated }) => {
	const { data, isError, isMutating, reset, trigger } = useEnhancedSWRMutation(
		UPDATE_SHIPMENT_KEY,
		updateShipment,
	);

	const handleClose = () => {
		reset();
		onClose();
	};

	const handleSubmit = async (values: ShipmentFormValues) => {
		if (!shipment) return;

		const response = await trigger({
			shipment,
			updates: {
				delivery_by_date: values.delivery_by_date.trim(),
				lat: Number(values.lat),
				lng: Number(values.lng),
				update_at: new Date().toISOString(),
			},
		});

		if (response.status !== ACTION_STATUS.SUCCESS) return;

		await onUpdated();
		handleClose();
	};

	return (
		<AntDrawer
			destroyOnHidden
			footer={
				<div className="flex justify-end gap-2">
					<Button disabled={isMutating} onClick={handleClose}>
						Cancel
					</Button>
					<Button
						disabled={!shipment}
						form="shipment-form"
						htmlType="submit"
						loading={isMutating}
						type="primary"
					>
						Save
					</Button>
				</div>
			}
			open={shipment !== null}
			title={shipment ? `Shipment ${shipment.label}` : "Shipment details"}
			size="min(480px, 100vw)"
			onClose={handleClose}
		>
			{shipment && (
				<Form
					key={shipment.id}
					id="shipment-form"
					initialValues={getFormValues(shipment)}
					layout="vertical"
					preserve={false}
					onFinish={handleSubmit}
				>
					{isError && (
						<Alert
							className="mb-4"
							message={data?.message || "Unable to update shipment. Please try again."}
							showIcon
							type="error"
						/>
					)}

					<Form.Item label="Client name" name="client_name">
						<Input disabled />
					</Form.Item>

					<Form.Item label="Status" name="status">
						<Select disabled options={SHIPMENT_STATUS_OPTIONS} />
					</Form.Item>

					<Form.Item label="Arrival date" name="arrival_date">
						<Input disabled />
					</Form.Item>

					<Form.Item
						label="Delivery by date"
						name="delivery_by_date"
						rules={[{ required: true, whitespace: true, message: "Delivery by date is required" }]}
					>
						<Input />
					</Form.Item>

					<Form.Item label="Warehouse ID" name="warehouse_id">
						<Input disabled />
					</Form.Item>

					<Form.Item label="Assignment ID" name="assignment_id">
						<Input disabled />
					</Form.Item>

					<div className="grid grid-cols-2 gap-4">
						<Form.Item
							className="mb-0"
							label="Latitude"
							name="lat"
							rules={[{ required: true, message: "Latitude is required" }]}
						>
							<Input inputMode="decimal" max={90} min={-90} step="any" type="number" />
						</Form.Item>

						<Form.Item
							className="mb-0"
							label="Longitude"
							name="lng"
							rules={[{ required: true, message: "Longitude is required" }]}
						>
							<Input inputMode="decimal" max={180} min={-180} step="any" type="number" />
						</Form.Item>
					</div>
				</Form>
			)}
		</AntDrawer>
	);
};

export default Drawer;
