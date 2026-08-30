import { Input } from "antd";
import type { Dayjs } from "dayjs";
import type { ComponentProps, FC } from "react";

const dateFormatter = new Intl.DateTimeFormat("en", {
	dateStyle: "medium",
	timeStyle: "short",
});

export const formatDateTime = (date: Dayjs) => dateFormatter.format(date.toDate());

type IArrivalDateInput = Omit<ComponentProps<typeof Input>, "value"> & {
	value?: Dayjs;
};

const ArrivalDateInput: FC<IArrivalDateInput> = ({ value, ...props }) => (
	<Input {...props} disabled value={value ? formatDateTime(value) : ""} />
);

export default ArrivalDateInput;
