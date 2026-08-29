import { ACTION_STATUS } from "@web/types/system";

export const INITIAL_ACTION_STATUS = { message: "", status: ACTION_STATUS.NORMAL };

export enum ACTION_TAG {
	/* dashboard */
	CREATE_ASSIGNMENT = "createAssignment",
	DELETE_ASSIGNMENT = "deleteAssignment",
	GET_ASSIGNMENT = "getAssignment",
	GET_MANY_ASSIGNMENTS = "getManyAssignments",
	GET_MANY_SHIPMENTS = "getManyShipments",
	UPDATE_SHIPMENT = "updateShipment",
}
