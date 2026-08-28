import { ACTION_STATUS } from "@web/types/system";

export const INITIAL_ACTION_STATUS = { message: "", status: ACTION_STATUS.NORMAL };

export enum ACTION_TAG {
	/* dashboard */
	GET_MANY_SHIPMENTS = "getManyShipments",
	UPDATE_SHIPMENT = "updateShipment",
}
