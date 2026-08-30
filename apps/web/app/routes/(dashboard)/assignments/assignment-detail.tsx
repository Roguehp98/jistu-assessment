import { Alert, Button, Modal, Popconfirm, Select, Skeleton, Tooltip } from "antd";
import { type FC, useEffect, useMemo, useState } from "react";

import {
	ACTION_STATUS,
	ASSIGNMENT_STATUS,
	type Assignment,
	SHIPMENT_STATUS,
	type Shipment,
} from "@repo/value";
import { deleteAssignment } from "@web/actions/dashboard/delete-assignment";
import { getAssignment } from "@web/actions/dashboard/get-assignment";
import { ACTION_TAG } from "@web/libs/actions";
import { sortByNearestNeighbor } from "@web/libs/nearest-neighbor-algo";
import { useEnhancedSWR, useEnhancedSWRMutation } from "@web/libs/swr";
import type { Coordinate, LocationMapPoint } from "@web/types/ui/location-map";
import LocationMap from "@web/ui/elements/location-map/wrapper";

type IAssignmentDetail = {
	assignment: Assignment | null;
	onClose: () => void;
	onDeleted: () => void;
};

const DELETE_ASSIGNMENT_KEY: [ACTION_TAG.DELETE_ASSIGNMENT] = [ACTION_TAG.DELETE_ASSIGNMENT];

const STATUS_LEGEND = [
	{ className: "bg-blue-600", label: "In transit" },
	{ className: "bg-green-600", label: "Delivered" },
];

const sortShipmentsForMap = (shipments: Shipment[]) =>
	sortByNearestNeighbor(
		[...shipments].sort(
			(left, right) =>
				Date.parse(left.eta) - Date.parse(right.eta) || left.id.localeCompare(right.id),
		),
	);

type IAssignmentDetailFooter = {
	deleteDisabledReason?: string;
	isDeleting: boolean;
	onClose: () => void;
	onDelete: () => Promise<void>;
};

const AssignmentDetailFooter: FC<IAssignmentDetailFooter> = ({
	deleteDisabledReason,
	isDeleting,
	onClose,
	onDelete,
}) => {
	const isDeleteDisabled = Boolean(deleteDisabledReason) || isDeleting;

	return (
		<div className="flex items-center justify-between gap-4">
			<Tooltip title={deleteDisabledReason}>
				<span>
					<Popconfirm
						disabled={isDeleteDisabled}
						title="Delete assignment?"
						description="This action cannot be undone."
						onConfirm={onDelete}
					>
						<Button danger disabled={isDeleteDisabled} loading={isDeleting}>
							Delete assignment
						</Button>
					</Popconfirm>
				</span>
			</Tooltip>

			<Button disabled={isDeleting} onClick={onClose}>
				Close
			</Button>
		</div>
	);
};

const AssignmentDetail: FC<IAssignmentDetail> = ({ assignment, onClose, onDeleted }) => {
	const assignmentId = assignment?.id;
	const { data: getAssignmentState, isError: isGetAssignmentError } = useEnhancedSWR(
		assignmentId ? [ACTION_TAG.GET_ASSIGNMENT, assignmentId] : null,
		getAssignment,
	);
	const {
		data: deleteAssignmentState,
		isError: isDeleteAssignmentError,
		isMutating: isDeleteAssignmentMutating,
		reset: resetDeleteAssignment,
		trigger: triggerDeleteAssignment,
	} = useEnhancedSWRMutation(DELETE_ASSIGNMENT_KEY, deleteAssignment);
	const [selectedShipmentId, setSelectedShipmentId] = useState<string | null>(null);
	const detail = getAssignmentState?.data?.data;
	const shipments = useMemo(() => (detail ? sortShipmentsForMap(detail.shipments) : []), [detail]);
	const points = useMemo<LocationMapPoint[]>(
		() =>
			shipments.map((shipment) => ({
				coordinate: [shipment.lat, shipment.lng],
				content: (
					<div>
						<strong>{shipment.label}</strong>
						<div>{shipment.client_name}</div>
					</div>
				),
				id: shipment.id,
				title: shipment.label,
				variant: shipment.status === SHIPMENT_STATUS.DELIVERED ? "success" : "info",
			})),
		[shipments],
	);
	const path = useMemo<Coordinate[]>(
		() => shipments.map(({ lat, lng }) => [lat, lng]),
		[shipments],
	);

	useEffect(() => {
		setSelectedShipmentId((currentId) => {
			if (shipments.some(({ id }) => id === currentId)) return currentId;

			return shipments[0]?.id ?? null;
		});
	}, [shipments]);

	const handleClose = () => {
		if (isDeleteAssignmentMutating) return;

		setSelectedShipmentId(null);
		resetDeleteAssignment();
		onClose();
	};

	const handleDelete = async () => {
		if (!detail || detail.shipments.length > 0 || detail.status === ASSIGNMENT_STATUS.COMPLETED)
			return;

		const response = await triggerDeleteAssignment({ id: detail.id });

		if (response.status !== ACTION_STATUS.SUCCESS) return;

		await onDeleted();
		handleClose();
	};

	const deleteDisabledReason = !detail
		? "Assignment details are loading"
		: detail.status === ASSIGNMENT_STATUS.COMPLETED
			? "Completed assignments cannot be deleted"
			: detail.shipments.length > 0
				? "Assignments with shipments cannot be deleted"
				: undefined;

	return (
		<Modal
			destroyOnHidden
			footer={
				<AssignmentDetailFooter
					deleteDisabledReason={deleteDisabledReason}
					isDeleting={isDeleteAssignmentMutating}
					onClose={handleClose}
					onDelete={handleDelete}
				/>
			}
			open={assignment !== null}
			title={detail?.label ?? assignment?.label ?? "Assignment details"}
			width={800}
			onCancel={handleClose}
		>
			{(isGetAssignmentError || isDeleteAssignmentError) && (
				<Alert
					title={
						isDeleteAssignmentError
							? deleteAssignmentState?.message || "Unable to delete assignment. Please try again."
							: getAssignmentState?.message || "Unable to load assignment. Please try again."
					}
					showIcon
					type="error"
				/>
			)}

			{!isGetAssignmentError && !detail && <Skeleton active paragraph={{ rows: 7 }} />}

			{detail && (
				<>
					<div className="mb-4">
						<label
							className="mb-2 block text-sm font-medium text-label"
							htmlFor="shipment-map-select"
						>
							Shipment
						</label>
						<Select
							id="shipment-map-select"
							className="w-full"
							options={shipments.map(({ client_name, id, label }) => ({
								label: `${label} - ${client_name}`,
								value: id,
							}))}
							placeholder="Select a shipment"
							value={selectedShipmentId ?? undefined}
							onChange={setSelectedShipmentId}
						/>
					</div>

					<fieldset className="mb-3 flex flex-wrap items-center gap-4 text-sm text-label">
						<legend className="sr-only">Shipment status</legend>
						{STATUS_LEGEND.map(({ className, label }) => (
							<span key={label} className="flex items-center gap-2">
								<span aria-hidden className={cn("size-2.5 rounded-full", className)} />
								{label}
							</span>
						))}
					</fieldset>

					<LocationMap
						path={path}
						points={points}
						selectedPointId={selectedShipmentId}
						onPointSelect={setSelectedShipmentId}
					/>
				</>
			)}
		</Modal>
	);
};

export default AssignmentDetail;
