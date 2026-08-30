import { DatePicker, Form, type FormItemProps, Input, Select } from "antd";
import type { Dayjs } from "dayjs";
import type { ComponentProps, ElementType, FC } from "react";

import type { Shipment } from "@repo/value";
import type { LocationMapPoint } from "@web/types/ui/location-map";
import LocationMap from "@web/ui/elements/location-map/wrapper";

import { SHIPMENT_STATUS_OPTIONS } from "../utils";

const dateFormatter = new Intl.DateTimeFormat("en", {
	dateStyle: "medium",
	timeStyle: "short",
});
const SHIPMENT_LOCATION_POINT_ID = "shipment-location";

export const COORDINATES_ERROR_MESSAGE =
	"Enter latitude and longitude separated by a comma within valid ranges";

export type ShipmentFormValues = {
	assignment_id?: string | null;
	arrival_date: Dayjs;
	client_name: string;
	coordinates: string;
	delivery_by_date: Dayjs;
	status: Shipment["status"];
	warehouse_id: string;
};

type CoordinateValues = {
	lat: number;
	lng: number;
};

type FormItemConfig = {
	Component: ElementType;
	className?: string;
	label: string;
	name: keyof ShipmentFormValues;
	rules?: FormItemProps["rules"];
};

const formatDateTime = (date: Dayjs) => dateFormatter.format(date.toDate());

const getNumbersBefore = (value: number) => Array.from({ length: value }, (_, index) => index);

const getDisabledTime = (date: Dayjs | null, arrivalDate: Dayjs) => {
	if (!date?.isSame(arrivalDate, "day")) return {};

	return {
		disabledHours: () => getNumbersBefore(arrivalDate.hour()),
		disabledMinutes: (hour: number) =>
			hour === arrivalDate.hour() ? getNumbersBefore(arrivalDate.minute()) : [],
		disabledSeconds: (hour: number, minute: number) =>
			hour === arrivalDate.hour() && minute === arrivalDate.minute()
				? getNumbersBefore(arrivalDate.second())
				: [],
	};
};

export const parseCoordinates = (value: string): CoordinateValues | null => {
	const parts = value.split(",").map((part) => part.trim());

	if (parts.length !== 2 || parts.some((part) => !part)) return null;

	const [lat, lng] = parts.map(Number);

	if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
	if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;

	return { lat, lng };
};

type ArrivalDateInputProps = Omit<ComponentProps<typeof Input>, "value"> & {
	value?: Dayjs;
};

const ArrivalDateInput: FC<ArrivalDateInputProps> = ({ value, ...props }) => (
	<Input {...props} disabled value={value ? formatDateTime(value) : ""} />
);

const DisabledInput: FC<ComponentProps<typeof Input>> = (props) => <Input {...props} disabled />;

const StatusSelect: FC<ComponentProps<typeof Select>> = (props) => (
	<Select {...props} disabled options={SHIPMENT_STATUS_OPTIONS} />
);

const CoordinatesInput: FC<ComponentProps<typeof Input>> = ({ value, ...props }) => {
	const coordinates = typeof value === "string" ? parseCoordinates(value) : null;
	const points: LocationMapPoint[] = coordinates
		? [
				{
					coordinate: [coordinates.lat, coordinates.lng],
					id: SHIPMENT_LOCATION_POINT_ID,
					title: "Shipment location",
				},
			]
		: [];

	return (
		<>
			<Input {...props} placeholder="32.7767, -96.7970" value={value} />

			<div className="mt-3">
				<LocationMap
					className="location-map--compact"
					emptyContent="Location preview unavailable"
					points={points}
					selectedPointId={SHIPMENT_LOCATION_POINT_ID}
				/>
			</div>
		</>
	);
};

const DeliveryDatePicker: FC<ComponentProps<typeof DatePicker>> = (props) => {
	const form = Form.useFormInstance<ShipmentFormValues>();
	const arrivalDate = Form.useWatch("arrival_date", form);

	return (
		<DatePicker
			{...props}
			className="w-full"
			disabledDate={(date) => arrivalDate?.isAfter(date, "day") ?? false}
			format={formatDateTime}
			showTime={{
				disabledTime: (date) => (arrivalDate ? getDisabledTime(date, arrivalDate) : {}),
				format: "h:mm A",
			}}
		/>
	);
};

const FORM_ITEMS: FormItemConfig[] = [
	{
		Component: DisabledInput,
		label: "Client name",
		name: "client_name",
	},
	{
		Component: StatusSelect,
		label: "Status",
		name: "status",
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
		Component: DisabledInput,
		label: "Assignment ID",
		name: "assignment_id",
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

const FormItems = () =>
	FORM_ITEMS.map(({ Component, className, label, name, rules }) => (
		<Form.Item key={name} className={className} label={label} name={name} rules={rules}>
			<Component />
		</Form.Item>
	));

export default FormItems;
