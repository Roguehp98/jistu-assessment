import { Alert, Modal, Select, Skeleton } from "antd";
import { type FC, useEffect, useMemo, useState } from "react";

import type { Assignment, Shipment } from "@repo/value";
import { getAssignment } from "@web/actions/dashboard/get-assignment";
import { ACTION_TAG } from "@web/libs/actions";
import { sortByNearestNeighbor } from "@web/libs/nearest-neighbor-algo";
import { useEnhancedSWR } from "@web/libs/swr";
import type { Coordinate, LocationMapPoint } from "@web/types/ui/location-map";
import LocationMap from "@web/ui/elements/location-map/wrapper";

type IAssignmentDetail = {
	assignment: Assignment | null;
	onClose: () => void;
};

const sortShipmentsForMap = (shipments: Shipment[]) =>
	sortByNearestNeighbor(
		[...shipments].sort(
			(left, right) =>
				Date.parse(left.eta) - Date.parse(right.eta) || left.id.localeCompare(right.id),
		),
	);

const AssignmentDetail: FC<IAssignmentDetail> = ({ assignment, onClose }) => {
	const assignmentId = assignment?.id;
	const { data: getAssignmentState, isError } = useEnhancedSWR(
		assignmentId ? [ACTION_TAG.GET_ASSIGNMENT, assignmentId] : null,
		getAssignment,
	);
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
		setSelectedShipmentId(null);
		onClose();
	};

	return (
		<Modal
			destroyOnHidden
			footer={null}
			open={assignment !== null}
			title={detail?.label ?? assignment?.label ?? "Assignment details"}
			width={800}
			onCancel={handleClose}
		>
			{isError && (
				<Alert
					title={getAssignmentState?.message || "Unable to load assignment. Please try again."}
					showIcon
					type="error"
				/>
			)}

			{!isError && !detail && <Skeleton active paragraph={{ rows: 7 }} />}

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
