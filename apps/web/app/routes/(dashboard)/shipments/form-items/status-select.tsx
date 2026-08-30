import { Select } from "antd";
import type { ComponentProps, FC } from "react";

import { SHIPMENT_STATUS } from "@repo/value";

import { SHIPMENT_STATUS_OPTIONS } from "../utils";

const STATUS_TRANSITIONS: Record<SHIPMENT_STATUS, SHIPMENT_STATUS[]> = {
	[SHIPMENT_STATUS.OPEN]: [SHIPMENT_STATUS.OPEN, SHIPMENT_STATUS.IN_TRANSIT],
	[SHIPMENT_STATUS.IN_TRANSIT]: [
		SHIPMENT_STATUS.OPEN,
		SHIPMENT_STATUS.IN_TRANSIT,
		SHIPMENT_STATUS.DELIVERED,
	],
	[SHIPMENT_STATUS.DELIVERED]: [SHIPMENT_STATUS.DELIVERED],
};

type IStatusSelect = ComponentProps<typeof Select> & {
	originalStatus: SHIPMENT_STATUS;
};

const StatusSelect: FC<IStatusSelect> = ({ originalStatus, ...props }) => {
	const allowedStatuses = STATUS_TRANSITIONS[originalStatus];
	const options = SHIPMENT_STATUS_OPTIONS.filter((option) =>
		allowedStatuses.includes(option.value),
	);

	return <Select {...props} options={options} />;
};

export default StatusSelect;
