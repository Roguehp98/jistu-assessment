import { ACTION_STATUS } from "@repo/value";

export const INITIAL_ACTION_STATUS = { message: "", status: ACTION_STATUS.NORMAL };

export enum ACTION_TAG {
	/* dashboard */
	CREATE_ASSIGNMENT = "createAssignment",
	CREATE_SHIPMENT = "createShipment",
	DELETE_ASSIGNMENT = "deleteAssignment",
	DELETE_SHIPMENT = "deleteShipment",
	GET_ASSIGNMENT = "getAssignment",
	GET_ASSIGNMENT_OPTIONS = "getAssignmentOptions",
	GET_MANY_ASSIGNMENTS = "getManyAssignments",
	GET_MANY_SHIPMENTS = "getManyShipments",
	UPDATE_SHIPMENT = "updateShipment",
}
