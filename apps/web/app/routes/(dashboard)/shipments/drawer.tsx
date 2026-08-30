import {
	Alert,
	Drawer as AntDrawer,
	Form as AntdForm,
	Button,
	type FormInstance,
	Popconfirm,
	Tooltip,
} from "antd";
import dayjs from "dayjs";
import { type FC, useEffect, useState } from "react";

import { ACTION_STATUS, SHIPMENT_STATUS, type Shipment } from "@repo/value";
import { deleteShipment } from "@web/actions/dashboard/delete-shipment";
import { updateShipment } from "@web/actions/dashboard/update-shipment";
import { ACTION_TAG } from "@web/libs/actions";
import { useEnhancedSWRMutation } from "@web/libs/swr";

import FormItems, {
	COORDINATES_ERROR_MESSAGE,
	parseCoordinates,
	type ShipmentFormValues,
} from "./form-items";

const UPDATE_SHIPMENT_KEY: [ACTION_TAG.UPDATE_SHIPMENT] = [ACTION_TAG.UPDATE_SHIPMENT];
const DELETE_SHIPMENT_KEY: [ACTION_TAG.DELETE_SHIPMENT] = [ACTION_TAG.DELETE_SHIPMENT];

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

type IFooter = {
	canSubmit: boolean;
	deleteDisabledReason?: string;
	isDeleting: boolean;
	isUpdating: boolean;
	onCancel: () => void;
	onDelete: () => Promise<void>;
};

const Footer: FC<IFooter> = ({
	canSubmit,
	deleteDisabledReason,
	isDeleting,
	isUpdating,
	onCancel,
	onDelete,
}) => {
	const isDeleteDisabled = Boolean(deleteDisabledReason) || isDeleting || isUpdating;

	return (
		<div className="flex items-center justify-between gap-4">
			<Tooltip title={deleteDisabledReason}>
				<span>
					<Popconfirm
						disabled={isDeleteDisabled}
						description="This action cannot be undone."
						title="Delete shipment?"
						onConfirm={onDelete}
					>
						<Button danger disabled={isDeleteDisabled} loading={isDeleting}>
							Delete shipment
						</Button>
					</Popconfirm>
				</span>
			</Tooltip>

			<div className="flex items-center gap-2">
				<Button disabled={isDeleting || isUpdating} onClick={onCancel}>
					Cancel
				</Button>
				<Button
					disabled={!canSubmit || isDeleting}
					form="shipment-form"
					htmlType="submit"
					loading={isUpdating}
					type="primary"
				>
					Save
				</Button>
			</div>
		</div>
	);
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
	const {
		data: updateShipmentState,
		isError: isUpdateShipmentError,
		isMutating: isUpdateShipmentMutating,
		reset: resetUpdateShipment,
		trigger: triggerUpdateShipment,
	} = useEnhancedSWRMutation(UPDATE_SHIPMENT_KEY, updateShipment);
	const {
		data: deleteShipmentState,
		isError: isDeleteShipmentError,
		isMutating: isDeleteShipmentMutating,
		reset: resetDeleteShipment,
		trigger: triggerDeleteShipment,
	} = useEnhancedSWRMutation(DELETE_SHIPMENT_KEY, deleteShipment);
	const [form] = AntdForm.useForm<ShipmentFormValues>();
	const formValues = AntdForm.useWatch([], form);
	const [canSubmit, setCanSubmit] = useState(false);

	const handleClose = () => {
		if (isDeleteShipmentMutating || isUpdateShipmentMutating) return;

		resetDeleteShipment();
		resetUpdateShipment();
		onClose();
	};

	const handleDelete = async () => {
		if (!shipment || shipment.assignment_id) return;

		const response = await triggerDeleteShipment({ id: shipment.id });

		if (response.status !== ACTION_STATUS.SUCCESS) return;

		await onUpdated();
		handleClose();
	};

	const handleSubmit = async (values: ShipmentFormValues) => {
		if (!shipment) return;

		const coordinates = parseCoordinates(values.coordinates);

		if (!coordinates) {
			form.setFields([{ name: "coordinates", errors: [COORDINATES_ERROR_MESSAGE] }]);

			return;
		}

		const response = await triggerUpdateShipment({
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

	const deleteDisabledReason = !shipment
		? "Shipment details are unavailable"
		: shipment.assignment_id
			? "Assigned shipments cannot be deleted"
			: undefined;
	const errorMessage = isDeleteShipmentError
		? deleteShipmentState?.message || "Unable to delete shipment. Please try again."
		: updateShipmentState?.message;

	return (
		<AntDrawer
			destroyOnHidden
			footer={
				<Footer
					canSubmit={Boolean(shipment) && canSubmit}
					deleteDisabledReason={deleteDisabledReason}
					isDeleting={isDeleteShipmentMutating}
					isUpdating={isUpdateShipmentMutating}
					onCancel={handleClose}
					onDelete={handleDelete}
				/>
			}
			open={shipment !== null}
			title={shipment ? `Shipment ${shipment.label}` : "Shipment details"}
			size="min(480px, 100vw)"
			onClose={handleClose}
		>
			{shipment && (
				<Form
					key={shipment.id}
					errorMessage={errorMessage}
					form={form}
					isError={isDeleteShipmentError || isUpdateShipmentError}
					shipment={shipment}
					onSubmit={handleSubmit}
				/>
			)}
		</AntDrawer>
	);
};

export default Drawer;
