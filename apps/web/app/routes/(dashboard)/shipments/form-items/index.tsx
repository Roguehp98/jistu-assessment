import { Form, type FormItemProps } from "antd";
import type { Dayjs } from "dayjs";
import type { ElementType, FC } from "react";

import type { SHIPMENT_STATUS, Shipment } from "@repo/value";

import ArrivalDateInput from "./arrival-date-input";
import AssignmentFormItem from "./assignment-form-item";
import CoordinatesInput, { COORDINATES_ERROR_MESSAGE, parseCoordinates } from "./coordinates-input";
import DeliveryDatePicker from "./delivery-date-picker";
import DisabledInput from "./disabled-input";
import StatusSelect from "./status-select";

export { COORDINATES_ERROR_MESSAGE, parseCoordinates };

export type ShipmentFormValues = {
	assignment_id?: string | null;
	arrival_date: Dayjs;
	client_name: string;
	coordinates: string;
	delivery_by_date: Dayjs;
	status: Shipment["status"];
	warehouse_id: string;
};

type FieldConfig = {
	Component: ElementType;
	className?: string;
	getComponentProps?: (props: IFormItems) => Record<string, unknown>;
	kind?: "field";
	label: string;
	name: keyof ShipmentFormValues;
	rules?: FormItemProps["rules"];
};

type StandaloneConfig = {
	Component: ElementType;
	key: string;
	kind: "standalone";
};

type FormItemConfig = FieldConfig | StandaloneConfig;

type IFormItems = {
	originalStatus: SHIPMENT_STATUS;
};

const FORM_ITEMS: FormItemConfig[] = [
	{
		Component: DisabledInput,
		label: "Client name",
		name: "client_name",
	},
	{
		Component: StatusSelect,
		getComponentProps: ({ originalStatus }) => ({ originalStatus }),
		label: "Status",
		name: "status",
	},
	{
		Component: AssignmentFormItem,
		key: "assignment_id",
		kind: "standalone",
	},
	{
		Component: ArrivalDateInput,
		label: "Arrival date",
		name: "arrival_date",
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
		Component: DisabledInput,
		label: "Warehouse ID",
		name: "warehouse_id",
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

		if (item.kind === "standalone") return <Component key={item.key} />;
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
