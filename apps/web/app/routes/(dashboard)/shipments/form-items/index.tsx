import { DatePicker, Form, type FormItemProps, Input } from "antd";
import type { Dayjs } from "dayjs";
import type { ElementType, FC } from "react";

import type { SHIPMENT_STATUS, Shipment } from "@repo/value";

import ArrivalDateInput, { formatDateTime } from "./arrival-date-input";
import AssignmentFormItem from "./assignment-form-item";
import CoordinatesInput, { COORDINATES_ERROR_MESSAGE, parseCoordinates } from "./coordinates-input";
import DeliveryDatePicker from "./delivery-date-picker";
import StatusSelect from "./status-select";

export { COORDINATES_ERROR_MESSAGE, parseCoordinates };

export type ShipmentFormMode = "create" | "edit";

export type ShipmentFormValues = {
	assignment_id?: string | null;
	arrival_date: Dayjs | null;
	client_name: string;
	coordinates: string;
	delivery_by_date: Dayjs | null;
	eta: Dayjs | null;
	label: string;
	status: Shipment["status"];
	warehouse_id: string;
};

type FieldConfig = {
	Component: ElementType;
	className?: string;
	getComponentProps?: (props: IFormItems) => Record<string, unknown>;
	kind?: "field";
	label: string;
	modes?: ShipmentFormMode[];
	name: keyof ShipmentFormValues;
	rules?: FormItemProps["rules"];
};

type StandaloneConfig = {
	Component: ElementType;
	getComponentProps?: (props: IFormItems) => Record<string, unknown>;
	key: string;
	kind: "standalone";
};

type FormItemConfig = FieldConfig | StandaloneConfig;

type IFormItems = {
	mode: ShipmentFormMode;
	originalAssignmentId: string | null;
	originalStatus: SHIPMENT_STATUS;
};

const FORM_ITEMS: FormItemConfig[] = [
	{
		Component: Input,
		label: "Label",
		modes: ["create"],
		name: "label",
		rules: [{ required: true, whitespace: true, message: "Label is required" }],
	},
	{
		Component: Input,
		getComponentProps: ({ mode }) => ({ disabled: mode === "edit" }),
		label: "Client name",
		name: "client_name",
		rules: [{ required: true, whitespace: true, message: "Client name is required" }],
	},
	{
		Component: StatusSelect,
		getComponentProps: ({ originalStatus }) => ({ originalStatus }),
		label: "Status",
		name: "status",
	},
	{
		Component: AssignmentFormItem,
		getComponentProps: ({ originalAssignmentId }) => ({ originalAssignmentId }),
		key: "assignment_id",
		kind: "standalone",
	},
	{
		Component: ArrivalDateInput,
		label: "Arrival date",
		modes: ["edit"],
		name: "arrival_date",
	},
	{
		Component: DatePicker,
		getComponentProps: () => ({ className: "w-full", format: "MMM D, YYYY" }),
		label: "Arrival date",
		modes: ["create"],
		name: "arrival_date",
		rules: [{ required: true, message: "Arrival date is required" }],
	},
	{
		Component: DeliveryDatePicker,
		label: "Delivery by date",
		name: "delivery_by_date",
		rules: [
			{ required: true, message: "Delivery by date is required" },
			({ getFieldValue }) => ({
				validator: (_, value: Dayjs | null) => {
					const arrivalDate = getFieldValue("arrival_date") as Dayjs | undefined;

					if (!value || !arrivalDate || !value.isBefore(arrivalDate)) return Promise.resolve();

					return Promise.reject(new Error("Delivery by date cannot be before arrival date"));
				},
			}),
		],
	},
	{
		Component: DatePicker,
		getComponentProps: () => ({
			className: "w-full",
			format: formatDateTime,
			showTime: { format: "h:mm A" },
		}),
		label: "ETA",
		modes: ["create"],
		name: "eta",
		rules: [{ required: true, message: "ETA is required" }],
	},
	{
		Component: Input,
		getComponentProps: ({ mode }) => ({ disabled: mode === "edit" }),
		label: "Warehouse ID",
		name: "warehouse_id",
		rules: [{ required: true, whitespace: true, message: "Warehouse ID is required" }],
	},
	{
		Component: CoordinatesInput,
		className: "mb-0",
		label: "Coordinates",
		name: "coordinates",
		rules: [
			{
				validator: (_, value: string | undefined) => {
					if (!value?.trim()) return Promise.reject(new Error("Coordinates are required"));
					if (parseCoordinates(value)) return Promise.resolve();

					return Promise.reject(new Error(COORDINATES_ERROR_MESSAGE));
				},
			},
		],
	},
];

const FormItems: FC<IFormItems> = (props) =>
	FORM_ITEMS.map((item) => {
		const Component = item.Component;

		if (item.kind === "standalone") {
			const componentProps = item.getComponentProps?.(props);

			return <Component key={item.key} {...componentProps} />;
		}

		if (item.modes && !item.modes.includes(props.mode)) return null;
		const componentProps = item.getComponentProps?.(props);

		return (
			<Form.Item
				key={item.name}
				className={item.className}
				label={item.label}
				name={item.name}
				rules={item.rules}
			>
				<Component {...componentProps} />
			</Form.Item>
		);
	});

export default FormItems;
