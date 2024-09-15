import { useReducer } from "react";

// Action types
export const actionTypes = {
	RESET: "RESET",
	SOCKET_INITIALIZED: "SOCKET_INITIALIZED",
	SOCKET_CONNECTED: "SOCKET_CONNECTED",

	SENT_IDENTITY: "SENT_IDENTITY",
	IDENTITY_CONFIRMED: "IDENTITY_CONFIRMED",

	SENT_ROOM_JOIN: "SENT_ROOM_JOIN",
	ROOM_JOIN_CONFIRMED: "ROOM_JOIN_CONFIRMED",
	START_ROOM_LEAVE: "START_ROOM_LEAVE",
	ROOM_LEAVE_CONFIRMED: "ROOM_LEAVE_CONFIRMED",

	ROOM_QUEUE_REQUESTED: "ROOM_QUEUE_REQUESTED",
	ROOM_QUEUE_RECEIVED: "ROOM_QUEUE_RECEIVED",

	ROOM_CHAT_REQUESTED: "ROOM_CHAT_REQUESTED",
	ROOM_CHAT_RECEIVED: "ROOM_CHAT_RECEIVED",

	REQUEST_DM_JOIN: "REQUEST_DM_JOIN",
	DM_JOIN_CONFIRMED: "DM_JOIN_CONFIRMED",

	REQUEST_DM_LEAVE: "REQUEST_DM_LEAVE",
	DM_LEAVE_CONFIRMED: "DM_LEAVE_CONFIRMED",

	DMS_REQUESTED: "DMS_REQUESTED",
	DMS_RECEIVED: "DMS_RECEIVED",

	REVALIDATE: "REVALIDATE",
	CLEAR_ROOM_STATE: "CLEAR_ROOM_STATE",
};

export type SocketHandshakesState = {
	socketConnected: boolean;
	socketInitialized: boolean;
	sentIdentity: boolean;
	identityConfirmed: boolean;
	sentRoomJoin: boolean;
	roomJoined: boolean;
	roomChatRequested: boolean;
	roomChatReceived: boolean;
	roomQueueRequested: boolean;
	roomQueueReceived: boolean;
	sentDMJoin: boolean;
	dmJoined: boolean;
	dmsRequested: boolean;
	dmsReceived: boolean;
};

export type SocketHandshakesAction = {
	type: string;
};

// Initial state
const initialState: SocketHandshakesState = {
	socketConnected: false,
	socketInitialized: false,
	sentIdentity: false,
	identityConfirmed: false,
	sentRoomJoin: false,
	roomJoined: false,
	roomChatRequested: false,
	roomChatReceived: false,
	roomQueueRequested: false,
	roomQueueReceived: false,
	sentDMJoin: false,
	dmJoined: false,
	dmsRequested: false,
	dmsReceived: false,
};

const socketInitialised: SocketHandshakesState = {
	...initialState,
	socketInitialized: true,
};

const socketConnected: SocketHandshakesState = {
	...socketInitialised,
	socketConnected: true,
};

// Reducer function
function reducer(state: SocketHandshakesState, action: SocketHandshakesAction) {
	switch (action.type) {
		/* ***** SOCKET OBJECT ***** */
		case actionTypes.RESET:
			return { ...initialState };
		case actionTypes.SOCKET_INITIALIZED:
			return { ...socketInitialised };
		case actionTypes.SOCKET_CONNECTED:
			return { ...socketConnected };

		/* ***** USER IDENTITY ***** */
		case actionTypes.SENT_IDENTITY:
			return {
				...socketConnected,
				sentIdentity: true,
				identityConfirmed: false,
			};
		case actionTypes.IDENTITY_CONFIRMED:
			return {
				...socketConnected,
				sentIdentity: true,
				identityConfirmed: true,
			};

		/* ***** ROOM JOIN/LEAVE ***** */
		case actionTypes.SENT_ROOM_JOIN:
			return { ...state, sentRoomJoin: true, roomJoined: false };
		case actionTypes.ROOM_JOIN_CONFIRMED:
			return { ...state, sentRoomJoin: true, roomJoined: true };
		case actionTypes.START_ROOM_LEAVE:
			return { ...state, roomJoined: false, sentRoomJoin: false };
		case actionTypes.ROOM_LEAVE_CONFIRMED:
			return {
				...state,
				sentRoomJoin: false,
				roomJoined: false,
				roomChatRequested: false,
				roomChatReceived: false,
				roomQueueRequested: false,
				roomQueueReceived: false,
			};

		/* ***** ROOM QUEUE ***** */
		case actionTypes.ROOM_QUEUE_REQUESTED:
			return { ...state, roomQueueRequested: true, roomQueueReceived: false };
		case actionTypes.ROOM_QUEUE_RECEIVED:
			return { ...state, roomQueueRequested: false, roomQueueReceived: true };

		/* ***** ROOM CHAT ***** */
		case actionTypes.ROOM_CHAT_REQUESTED:
			return { ...state, roomChatRequested: true, roomChatReceived: false };
		case actionTypes.ROOM_CHAT_RECEIVED:
			return { ...state, roomChatRequested: false, roomChatReceived: true };

		/* ***** DM CONNECTION ***** */
		case actionTypes.REQUEST_DM_JOIN:
			return {
				...state,
				dmJoined: false,
				sentDMJoin: true,
				dmsRequested: false,
				dmsReceived: false,
			};
		case actionTypes.DM_JOIN_CONFIRMED:
			return {
				...state,
				dmJoined: true,
				sentDMJoin: false,
				dmsRequested: false,
				dmsReceived: false,
			};
		case actionTypes.REQUEST_DM_LEAVE:
			return {
				...state,
				dmJoined: true,
				dmsRequested: false,
				dmsReceived: true,
			};
		case actionTypes.DM_LEAVE_CONFIRMED:
			return {
				...state,
				dmJoined: false,
				sentDMJoin: false,
				dmsRequested: false,
				dmsReceived: false,
			};

		/* ***** DM HISTORY ***** */
		case actionTypes.DMS_REQUESTED:
			return {
				...state,
				dmsRequested: true,
				dmsReceived: false,
			};
		case actionTypes.DMS_RECEIVED:
			return {
				...state,
				dmsRequested: false,
				dmsReceived: true,
			};

		/* ***** MORE ***** */
		case actionTypes.REVALIDATE:
			return { ...state, socketConnected: true };
		case actionTypes.CLEAR_ROOM_STATE:
			return {
				...state,
				sentRoomJoin: false,
				roomJoined: false,
				roomChatRequested: false,
				roomChatReceived: false,
				roomQueueRequested: false,
				roomQueueReceived: false,
			};
		default:
			return state;
	}
}

export function useLiveState() {
	const [state, dispatch] = useReducer(reducer, initialState);
	return { state, dispatch };
}
