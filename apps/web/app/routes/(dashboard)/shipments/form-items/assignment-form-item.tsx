import { Form, Select } from "antd";
import { type FC, useEffect } from "react";

import { SHIPMENT_STATUS } from "@repo/value";
import { getAssignmentOptions } from "@web/actions/dashboard/get-assignment-options";
import { ACTION_TAG } from "@web/libs/actions";
import { useEnhancedSWR } from "@web/libs/swr";

import type { ShipmentFormValues } from ".";

type IAssignmentFormItem = {
	originalAssignmentId: string | null;
};

const AssignmentFormItem: FC<IAssignmentFormItem> = ({ originalAssignmentId }) => {
	const form = Form.useFormInstance<ShipmentFormValues>();
	const status = Form.useWatch("status", form);
	const assignmentId = Form.useWatch("assignment_id", form);
	const {
		data: getAssignmentOptionsState,
		isLoading: isGetAssignmentOptionsLoading,
		isError: isGetAssignmentOptionsError,
	} = useEnhancedSWR(
		status === SHIPMENT_STATUS.IN_TRANSIT ? [ACTION_TAG.GET_ASSIGNMENT_OPTIONS] : null,
		getAssignmentOptions,
	);

	useEffect(() => {
		if (!status) return;

		if (status === SHIPMENT_STATUS.OPEN) {
			if (form.getFieldValue("assignment_id") !== null) form.setFieldValue("assignment_id", null);

			return;
		}

		if (
			status === SHIPMENT_STATUS.DELIVERED &&
			form.getFieldValue("assignment_id") !== originalAssignmentId
		) {
			form.setFieldValue("assignment_id", originalAssignmentId);
		}
	}, [form, originalAssignmentId, status]);

	if (!status || status === SHIPMENT_STATUS.OPEN) return null;

	const options = (getAssignmentOptionsState?.data?.data ?? []).map(({ id, label }) => ({
		label: `${label} (${id})`,
		value: id,
	}));

	if (assignmentId && !options.some(({ value }) => value === assignmentId)) {
		options.unshift({ label: assignmentId, value: assignmentId });
	}

	return (
		<Form.Item
			help={
				isGetAssignmentOptionsError
					? getAssignmentOptionsState?.message || "Unable to load assignments. Please try again."
					: undefined
			}
			label="Assignment ID"
			name="assignment_id"
			rules={[{ required: true, message: "Assignment is required" }]}
			validateStatus={isGetAssignmentOptionsError ? "error" : undefined}
		>
			<Select
				disabled={status === SHIPMENT_STATUS.DELIVERED}
				loading={isGetAssignmentOptionsLoading}
				options={options}
				placeholder="Select an assignment"
				showSearch={{ optionFilterProp: "label" }}
			/>
		</Form.Item>
	);
};

export default AssignmentFormItem;
