import { Alert, Button, Form, Input, Modal } from "antd";
import { type FC, useEffect, useState } from "react";

import { ACTION_STATUS } from "@repo/value";
import { createAssignment } from "@web/actions/dashboard/create-assignment";
import { ACTION_TAG } from "@web/libs/actions";
import { useEnhancedSWRMutation } from "@web/libs/swr";

const CREATE_ASSIGNMENT_KEY: [ACTION_TAG.CREATE_ASSIGNMENT] = [ACTION_TAG.CREATE_ASSIGNMENT];

type CreateAssignmentFormValues = {
	label: string;
};

export type ICreateNewAssignment = {
	open: boolean;
	onClose: () => void;
	onCreated: () => void;
};

const CreateNewAssignment: FC<ICreateNewAssignment> = ({ open, onClose, onCreated }) => {
	const { data, isError, isMutating, reset, trigger } = useEnhancedSWRMutation(
		CREATE_ASSIGNMENT_KEY,
		createAssignment,
	);
	const [form] = Form.useForm<CreateAssignmentFormValues>();
	const label = Form.useWatch("label", form);
	const [canSubmit, setCanSubmit] = useState(false);

	const handleClose = () => {
		if (isMutating) return;

		form.resetFields();
		reset();
		setCanSubmit(false);
		onClose();
	};

	const handleSubmit = async ({ label }: CreateAssignmentFormValues) => {
		const response = await trigger({ label: label.trim() });

		if (response.status !== ACTION_STATUS.SUCCESS) return;

		await onCreated();
		handleClose();
	};

	useEffect(() => {
		if (!open || !label?.trim()) {
			setCanSubmit(false);

			return;
		}

		let isCurrentValidation = true;

		form.validateFields(["label"], { validateOnly: true }).then(
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
	}, [form, label, open]);

	return (
		<Modal
			destroyOnHidden
			footer={
				<div className="flex justify-end gap-2">
					<Button disabled={isMutating} onClick={handleClose}>
						Cancel
					</Button>
					<Button
						disabled={!canSubmit}
						form="create-assignment-form"
						htmlType="submit"
						loading={isMutating}
						type="primary"
					>
						Create
					</Button>
				</div>
			}
			open={open}
			title="Create assignment"
			width={420}
			onCancel={handleClose}
		>
			<Form
				form={form}
				id="create-assignment-form"
				layout="vertical"
				preserve={false}
				onFinish={handleSubmit}
			>
				{isError && (
					<Alert
						className="mb-4"
						title={data?.message || "Unable to create assignment. Please try again."}
						showIcon
						type="error"
					/>
				)}

				<Form.Item
					label="Label"
					name="label"
					rules={[{ required: true, whitespace: true, message: "Label is required" }]}
				>
					<Input autoFocus maxLength={100} placeholder="Assignment label" />
				</Form.Item>
			</Form>
		</Modal>
	);
};

export default CreateNewAssignment;
