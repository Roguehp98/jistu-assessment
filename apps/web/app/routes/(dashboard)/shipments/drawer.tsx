import { Alert, Drawer as AntDrawer, Form as AntdForm, Button, type FormInstance } from "antd";
import dayjs from "dayjs";
import { type FC, useEffect, useState } from "react";

import { ACTION_STATUS, SHIPMENT_STATUS, type Shipment } from "@repo/value";
import { updateShipment } from "@web/actions/dashboard/update-shipment";
import { ACTION_TAG } from "@web/libs/actions";
import { useEnhancedSWRMutation } from "@web/libs/swr";

import FormItems, {
	COORDINATES_ERROR_MESSAGE,
	parseCoordinates,
	type ShipmentFormValues,
} from "./form-items";

const UPDATE_SHIPMENT_KEY: [ACTION_TAG.UPDATE_SHIPMENT] = [ACTION_TAG.UPDATE_SHIPMENT];

type IDrawer = {
	shipment: Shipment | null;
	onClose: () => void;
	onUpdated: () => Promise<void>;
};

const getFormValues = (shipment: Shipment): ShipmentFormValues => ({
	assignment_id: shipment.assignment_id,
	arrival_date: dayjs(shipment.arrival_date),
	client_name: shipment.client_name,
	coordinates: `${shipment.lat}, ${shipment.lng}`,
	delivery_by_date: dayjs(shipment.delivery_by_date),
	status: shipment.status,
	warehouse_id: shipment.warehouse_id,
});

type IShipmentForm = {
	errorMessage?: string;
	form: FormInstance<ShipmentFormValues>;
	isError: boolean;
	shipment: Shipment;
	onSubmit: (values: ShipmentFormValues) => Promise<void>;
};

const Form: FC<IShipmentForm> = ({ errorMessage, form, isError, shipment, onSubmit }) => {
	return (
		<AntdForm
			form={form}
			id="shipment-form"
			initialValues={getFormValues(shipment)}
			layout="vertical"
			preserve={false}
			onFinish={onSubmit}
		>
			{isError && (
				<Alert
					className="mb-4"
					title={errorMessage || "Unable to update shipment. Please try again."}
					showIcon
					type="error"
				/>
			)}

			<FormItems originalStatus={shipment.status} />
		</AntdForm>
	);
};

const Drawer: FC<IDrawer> = ({ shipment, onClose, onUpdated }) => {
	const { data, isError, isMutating, reset, trigger } = useEnhancedSWRMutation(
		UPDATE_SHIPMENT_KEY,
		updateShipment,
	);
	const [form] = AntdForm.useForm<ShipmentFormValues>();
	const formValues = AntdForm.useWatch([], form);
	const [canSubmit, setCanSubmit] = useState(false);

	const handleClose = () => {
		reset();
		onClose();
	};

	const handleSubmit = async (values: ShipmentFormValues) => {
		if (!shipment) return;

		const coordinates = parseCoordinates(values.coordinates);

		if (!coordinates) {
			form.setFields([{ name: "coordinates", errors: [COORDINATES_ERROR_MESSAGE] }]);

			return;
		}

		const response = await trigger({
			shipment,
			updates: {
				assignment_id:
					values.status === SHIPMENT_STATUS.OPEN ? null : (values.assignment_id ?? null),
				delivery_by_date: values.delivery_by_date.toISOString(),
				lat: coordinates.lat,
				lng: coordinates.lng,
				status: values.status,
			},
		});

		if (response.status !== ACTION_STATUS.SUCCESS) return;

		await onUpdated();
		handleClose();
	};

	useEffect(() => {
		if (shipment) form.setFieldsValue(getFormValues(shipment));
	}, [form, shipment]);

	useEffect(() => {
		if (!shipment || !formValues) {
			setCanSubmit(false);

			return;
		}

		let isCurrentValidation = true;

		form.validateFields({ validateOnly: true }).then(
			() => {
				if (isCurrentValidation) setCanSubmit(true);
			},
			() => {
				if (isCurrentValidation) setCanSubmit(false);
			},
		);

		return () => {
			isCurrentValidation = false;
		};
	}, [form, formValues, shipment]);

	return (
		<AntDrawer
			destroyOnHidden
			footer={
				<div className="flex justify-end gap-2">
					<Button disabled={isMutating} onClick={handleClose}>
						Cancel
					</Button>
					<Button
						disabled={!shipment || !canSubmit}
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
					errorMessage={data?.message}
					form={form}
					isError={isError}
					shipment={shipment}
					onSubmit={handleSubmit}
				/>
			)}
		</AntDrawer>
	);
};

export default Drawer;
