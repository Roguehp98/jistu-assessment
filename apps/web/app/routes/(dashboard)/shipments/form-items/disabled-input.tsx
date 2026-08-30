import { Input } from "antd";
import type { ComponentProps, FC } from "react";

const DisabledInput: FC<ComponentProps<typeof Input>> = (props) => <Input {...props} disabled />;

export default DisabledInput;
