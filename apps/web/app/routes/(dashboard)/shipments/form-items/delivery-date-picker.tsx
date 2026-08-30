import { DatePicker, Form } from "antd";
import type { Dayjs } from "dayjs";
import type { ComponentProps, FC } from "react";

import type { ShipmentFormValues } from ".";
import { formatDateTime } from "./arrival-date-input";

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

export default DeliveryDatePicker;
