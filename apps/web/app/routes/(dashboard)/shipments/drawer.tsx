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
import { createShipment } from "@web/actions/dashboard/create-shipment";
import { deleteShipment } from "@web/actions/dashboard/delete-shipment";
import { updateShipment } from "@web/actions/dashboard/update-shipment";
import { ACTION_TAG } from "@web/libs/actions";
import { useEnhancedSWRMutation } from "@web/libs/swr";

import FormItems, {
	COORDINATES_ERROR_MESSAGE,
	parseCoordinates,
	type ShipmentFormMode,
	type ShipmentFormValues,
} from "./form-items";

const CREATE_SHIPMENT_KEY: [ACTION_TAG.CREATE_SHIPMENT] = [ACTION_TAG.CREATE_SHIPMENT];
const DELETE_SHIPMENT_KEY: [ACTION_TAG.DELETE_SHIPMENT] = [ACTION_TAG.DELETE_SHIPMENT];
const UPDATE_SHIPMENT_KEY: [ACTION_TAG.UPDATE_SHIPMENT] = [ACTION_TAG.UPDATE_SHIPMENT];

export type ShipmentDrawerState = { mode: "create" } | { mode: "edit"; shipment: Shipment } | null;

type OpenShipmentDrawerState = Exclude<ShipmentDrawerState, null>;

type IDrawer = {
	state: ShipmentDrawerState;
	onClose: () => void;
	onUpdated: () => Promise<void>;
};

const getCreateFormValues = (): ShipmentFormValues => ({
	assignment_id: null,
	arrival_date: null,
	client_name: "",
	coordinates: "",
	delivery_by_date: null,
	eta: null,
	label: "",
	status: SHIPMENT_STATUS.OPEN,
	warehouse_id: "",
});

const getEditFormValues = (shipment: Shipment): ShipmentFormValues => ({
	assignment_id: shipment.assignment_id,
	arrival_date: dayjs(shipment.arrival_date),
	client_name: shipment.client_name,
	coordinates: `${shipment.lat}, ${shipment.lng}`,
	delivery_by_date: dayjs(shipment.delivery_by_date),
	eta: dayjs(shipment.eta),
	label: shipment.label,
	status: shipment.status,
	warehouse_id: shipment.warehouse_id,
});

const getFormValues = (state: OpenShipmentDrawerState) =>
	state.mode === "create" ? getCreateFormValues() : getEditFormValues(state.shipment);

type IShipmentForm = {
	errorMessage?: string;
	form: FormInstance<ShipmentFormValues>;
	initialValues: ShipmentFormValues;
	isError: boolean;
	mode: ShipmentFormMode;
	originalAssignmentId: string | null;
	originalStatus: SHIPMENT_STATUS;
	onSubmit: (values: ShipmentFormValues) => Promise<void>;
};

type IFooter = {
	canSubmit: boolean;
	deleteDisabledReason?: string;
	isDeleting: boolean;
	isSaving: boolean;
	mode: ShipmentFormMode;
	onCancel: () => void;
	onDelete: () => Promise<void>;
};

const Footer: FC<IFooter> = ({
	canSubmit,
	deleteDisabledReason,
	isDeleting,
	isSaving,
	mode,
	onCancel,
	onDelete,
}) => {
	const isDeleteDisabled = Boolean(deleteDisabledReason) || isDeleting || isSaving;

	return (
		<div
			className={cn("flex items-center gap-4", mode === "edit" ? "justify-between" : "justify-end")}
		>
			{mode === "edit" && (
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
			)}

			<div className="flex items-center gap-2">
				<Button disabled={isDeleting || isSaving} onClick={onCancel}>
					Cancel
				</Button>
				<Button
					disabled={!canSubmit || isDeleting}
					form="shipment-form"
					htmlType="submit"
					loading={isSaving}
					type="primary"
				>
					{mode === "create" ? "Create" : "Save"}
				</Button>
			</div>
		</div>
	);
};

const Form: FC<IShipmentForm> = ({
	errorMessage,
	form,
	initialValues,
	isError,
	mode,
	originalAssignmentId,
	originalStatus,
	onSubmit,
}) => (
	<AntdForm
		form={form}
		id="shipment-form"
		initialValues={initialValues}
		layout="vertical"
		preserve={false}
		onFinish={onSubmit}
	>
		{isError && (
			<Alert
				className="mb-4"
				title={errorMessage || "Unable to save shipment. Please try again."}
				showIcon
				type="error"
			/>
		)}

		<FormItems
			mode={mode}
			originalAssignmentId={originalAssignmentId}
			originalStatus={originalStatus}
		/>
	</AntdForm>
);

const Drawer: FC<IDrawer> = ({ state, onClose, onUpdated }) => {
	const {
		data: createShipmentState,
		isError: isCreateShipmentError,
		isMutating: isCreateShipmentMutating,
		reset: resetCreateShipment,
		trigger: triggerCreateShipment,
	} = useEnhancedSWRMutation(CREATE_SHIPMENT_KEY, createShipment);
	const {
		data: deleteShipmentState,
		isError: isDeleteShipmentError,
		isMutating: isDeleteShipmentMutating,
		reset: resetDeleteShipment,
		trigger: triggerDeleteShipment,
	} = useEnhancedSWRMutation(DELETE_SHIPMENT_KEY, deleteShipment);
	const {
		data: updateShipmentState,
		isError: isUpdateShipmentError,
		isMutating: isUpdateShipmentMutating,
		reset: resetUpdateShipment,
		trigger: triggerUpdateShipment,
	} = useEnhancedSWRMutation(UPDATE_SHIPMENT_KEY, updateShipment);
	const [form] = AntdForm.useForm<ShipmentFormValues>();
	const formValues = AntdForm.useWatch([], form);
	const [canSubmit, setCanSubmit] = useState(false);
	const shipment = state?.mode === "edit" ? state.shipment : null;
	const mode = state?.mode ?? "create";
	const isSaving = isCreateShipmentMutating || isUpdateShipmentMutating;

	const handleClose = () => {
		if (isDeleteShipmentMutating || isSaving) return;

		resetCreateShipment();
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
		if (!state || !values.delivery_by_date) return;

		const coordinates = parseCoordinates(values.coordinates);

		if (!coordinates) {
			form.setFields([{ name: "coordinates", errors: [COORDINATES_ERROR_MESSAGE] }]);

			return;
		}

		const assignmentId =
			values.status === SHIPMENT_STATUS.OPEN ? null : (values.assignment_id ?? null);
		let isSuccess = false;

		if (state.mode === "create") {
			if (!values.arrival_date || !values.eta) return;

			const response = await triggerCreateShipment({
				assignment_id: assignmentId,
				arrival_date: `${values.arrival_date.format("YYYY-MM-DD")}T00:00:00.000Z`,
				client_name: values.client_name.trim(),
				delivery_by_date: values.delivery_by_date.toISOString(),
				eta: values.eta.toISOString(),
				label: values.label.trim(),
				lat: coordinates.lat,
				lng: coordinates.lng,
				status: values.status,
				warehouse_id: values.warehouse_id.trim(),
			});
			isSuccess = response.status === ACTION_STATUS.SUCCESS;
		} else {
			const response = await triggerUpdateShipment({
				shipment: state.shipment,
				updates: {
					assignment_id: assignmentId,
					delivery_by_date: values.delivery_by_date.toISOString(),
					lat: coordinates.lat,
					lng: coordinates.lng,
					status: values.status,
				},
			});
			isSuccess = response.status === ACTION_STATUS.SUCCESS;
		}

		if (!isSuccess) return;

		await onUpdated();
		handleClose();
	};

	useEffect(() => {
		setCanSubmit(false);

		if (!state) return;

		form.resetFields();
		form.setFieldsValue(getFormValues(state));
	}, [form, state]);

	useEffect(() => {
		if (!state || !formValues) {
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
	}, [form, formValues, state]);

	const deleteDisabledReason = !shipment
		? "Shipment details are unavailable"
		: shipment.assignment_id
			? "Assigned shipments cannot be deleted"
			: undefined;
	let errorMessage = updateShipmentState?.message;

	if (isCreateShipmentError)
		errorMessage = createShipmentState?.message || "Unable to create shipment. Please try again.";
	if (isDeleteShipmentError)
		errorMessage = deleteShipmentState?.message || "Unable to delete shipment. Please try again.";

	const initialValues = state ? getFormValues(state) : getCreateFormValues();
	const originalAssignmentId = shipment?.assignment_id ?? null;
	const originalStatus = shipment?.status ?? SHIPMENT_STATUS.OPEN;
	const isError = isCreateShipmentError || isDeleteShipmentError || isUpdateShipmentError;

	return (
		<AntDrawer
			destroyOnHidden
			footer={
				state ? (
					<Footer
						canSubmit={canSubmit}
						deleteDisabledReason={deleteDisabledReason}
						isDeleting={isDeleteShipmentMutating}
						isSaving={isSaving}
						mode={mode}
						onCancel={handleClose}
						onDelete={handleDelete}
					/>
				) : null
			}
			open={state !== null}
			title={mode === "create" ? "Create shipment" : `Shipment ${shipment?.label ?? ""}`}
			size="min(480px, 100vw)"
			onClose={handleClose}
		>
			{state && (
				<Form
					key={state.mode === "create" ? "create" : state.shipment.id}
					errorMessage={errorMessage}
					form={form}
					initialValues={initialValues}
					isError={isError}
					mode={mode}
					originalAssignmentId={originalAssignmentId}
					originalStatus={originalStatus}
					onSubmit={handleSubmit}
				/>
			)}
		</AntDrawer>
	);
};

export default Drawer;
