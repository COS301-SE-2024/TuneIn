import { useReducer } from "react";
import { SOCKET_EVENTS } from "../../constants";

// Action types
export const actionTypes = {
	RESET: "RESET",
	SOCKET_INITIALIZED: "SOCKET_INITIALIZED",

	SENT_IDENTITY: "SENT_IDENTITY",

	SENT_ROOM_JOIN: "SENT_ROOM_JOIN",
	ROOM_JOIN_CONFIRMED: "ROOM_JOIN_CONFIRMED",
	START_ROOM_LEAVE: "START_ROOM_LEAVE",
	ROOM_LEAVE_CONFIRMED: "ROOM_LEAVE_CONFIRMED",

	ROOM_QUEUE_REQUESTED: "ROOM_QUEUE_REQUESTED",

	ROOM_CHAT_REQUESTED: "ROOM_CHAT_REQUESTED",

	REQUEST_DM_JOIN: "REQUEST_DM_JOIN",
	DM_JOIN_CONFIRMED: "DM_JOIN_CONFIRMED",

	REQUEST_DM_LEAVE: "REQUEST_DM_LEAVE",
	DM_LEAVE_CONFIRMED: "DM_LEAVE_CONFIRMED",

	DMS_REQUESTED: "DMS_REQUESTED",

	REVALIDATE: "REVALIDATE",
	CLEAR_ROOM_STATE: "CLEAR_ROOM_STATE",
	CLEAR_DM_STATE: "CLEAR_DM_STATE",
};

const internalActions = {
	SOCKET_CONNECTED: "SOCKET_CONNECTED",
	IDENTITY_CONFIRMED: "IDENTITY_CONFIRMED",
	ROOM_QUEUE_RECEIVED: "ROOM_QUEUE_RECEIVED",
	ROOM_CHAT_RECEIVED: "ROOM_CHAT_RECEIVED",
	DMS_RECEIVED: "DMS_RECEIVED",
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

const socketConnected: SocketHandshakesState = {
	...initialState,
	socketConnected: true,
};

const socketInitialised: SocketHandshakesState = {
	...socketConnected,
	socketInitialized: true,
};

// Reducer function
function stateReducer(
	state: SocketHandshakesState,
	action: SocketHandshakesAction,
) {
	console.log("CHANGING SOCKET STATE DUE TO INPUT: " + action.type);
	switch (action.type) {
		/* ***** SOCKET OBJECT ***** */
		case actionTypes.RESET:
			return { ...initialState };
		case actionTypes.SOCKET_INITIALIZED:
			//return { ...socketInitialised };
			return { ...state, socketConnected: true, socketInitialized: true };
		case internalActions.SOCKET_CONNECTED:
			//return { ...socketConnected };
			return { ...state, socketConnected: true };

		/* ***** USER IDENTITY ***** */
		case actionTypes.SENT_IDENTITY:
			return {
				...state,
				sentIdentity: true,
				identityConfirmed: false,
			};
		case internalActions.IDENTITY_CONFIRMED:
			return {
				...state,
				sentIdentity: true,
				identityConfirmed: true,
			};

		/* ***** ROOM JOIN/LEAVE ***** */
		case actionTypes.SENT_ROOM_JOIN:
			return { ...state, sentRoomJoin: true, roomJoined: false };
		case actionTypes.ROOM_JOIN_CONFIRMED:
			console.log("RECEIVED: ROOM_JOIN_CONFIRMED");
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
		case internalActions.ROOM_QUEUE_RECEIVED:
			return { ...state, roomQueueRequested: false, roomQueueReceived: true };

		/* ***** ROOM CHAT ***** */
		case actionTypes.ROOM_CHAT_REQUESTED:
			return { ...state, roomChatRequested: true, roomChatReceived: false };
		case internalActions.ROOM_CHAT_RECEIVED:
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
		case internalActions.DMS_RECEIVED:
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
		case actionTypes.CLEAR_DM_STATE:
			return {
				...state,
				sentDMJoin: false,
				dmJoined: false,
				dmsRequested: false,
				dmsReceived: false,
			};
		default:
			return state;
	}
}

export const RESET_EVENTS = "RESET_EVENT";
export const NEW_ROOM = "NEW_ROOM";
export const NEW_DM = "NEW_DM";

const socketEvents = Object.values(SOCKET_EVENTS);
export function useLiveState() {
	const [socketState, updateState] = useReducer(stateReducer, initialState);
	const [socketEventsReceived, handleReceivedEvent] = useReducer(
		(state: Map<string, number>, action: string) => {
			if (
				action === RESET_EVENTS ||
				action === "connect_error" ||
				action === "disconnect"
			) {
				updateState({ type: actionTypes.RESET });
				return new Map<string, number>();
			} else if (action === NEW_ROOM) {
				updateState({ type: actionTypes.CLEAR_ROOM_STATE });
				state.set(SOCKET_EVENTS.ROOM_JOINED, 0);
				state.set(SOCKET_EVENTS.ROOM_LEFT, 0);
				state.set(SOCKET_EVENTS.MESSAGE_SENT, 0);
				state.set(SOCKET_EVENTS.MESSAGE_RECEIVED, 0);
				state.set(SOCKET_EVENTS.USER_JOINED_ROOM, 0);
				state.set(SOCKET_EVENTS.USER_LEFT_ROOM, 0);
				state.set(SOCKET_EVENTS.LIVE_CHAT_HISTORY, 0);
				state.set(SOCKET_EVENTS.PLAY_MEDIA, 0);
				state.set(SOCKET_EVENTS.PAUSE_MEDIA, 0);
				state.set(SOCKET_EVENTS.STOP_MEDIA, 0);
				state.set(SOCKET_EVENTS.SONG_ADDED, 0);
				state.set(SOCKET_EVENTS.SONG_REMOVED, 0);
				state.set(SOCKET_EVENTS.VOTE_UPDATED, 0);
				state.set(SOCKET_EVENTS.QUEUE_STATE, 0);
				state.set(SOCKET_EVENTS.ROOM_SETTINGS_CHANGED, 0);
				state.set(SOCKET_EVENTS.LIVE_MESSAGE, 0);
				state.set(SOCKET_EVENTS.CURRENT_MEDIA, 0);
				return state;
			} else if (action === NEW_DM) {
				updateState({ type: actionTypes.CLEAR_DM_STATE });
				state.set(SOCKET_EVENTS.DIRECT_MESSAGE, 0);
				state.set(SOCKET_EVENTS.TYPING, 0);
				state.set(SOCKET_EVENTS.STOP_TYPING, 0);
				state.set(SOCKET_EVENTS.USER_ONLINE, 0);
				state.set(SOCKET_EVENTS.USER_OFFLINE, 0);
				state.set(SOCKET_EVENTS.CHAT_MODIFIED, 0);
				state.set(SOCKET_EVENTS.DM_HISTORY, 0);
				return state;
			} else if (socketEvents.includes(action) || action === "connect") {
				console.log(`SOCKET MESSAGE RECEIVED: ${action}`);
				const count = state.get(action) || 0;
				state.set(action, count + 1);

				const socketConnectCount = state.get("connect") || 0;
				if (socketConnectCount > 0) {
					updateState({ type: internalActions.SOCKET_CONNECTED });
				}

				const serverConnectedCount = state.get(SOCKET_EVENTS.CONNECTED) || 0;
				if (serverConnectedCount > 0) {
					updateState({ type: internalActions.SOCKET_CONNECTED });
					updateState({ type: actionTypes.SOCKET_INITIALIZED });
					updateState({ type: internalActions.IDENTITY_CONFIRMED });
				}

				const serverDisconnectedCount =
					state.get(SOCKET_EVENTS.DISCONNECTED) || 0;
				if (serverDisconnectedCount > 0) {
					updateState({ type: actionTypes.RESET });
				}

				const roomQueueReceivedCount =
					state.get(SOCKET_EVENTS.QUEUE_STATE) || 0;
				if (roomQueueReceivedCount > 0) {
					updateState({ type: internalActions.ROOM_QUEUE_RECEIVED });
				}

				const roomChatReceivedCount =
					state.get(SOCKET_EVENTS.LIVE_CHAT_HISTORY) || 0;
				if (roomChatReceivedCount > 0) {
					updateState({ type: internalActions.ROOM_CHAT_RECEIVED });
				}

				const dmHistoryReceivedCount = state.get(SOCKET_EVENTS.DM_HISTORY) || 0;
				if (dmHistoryReceivedCount > 0) {
					updateState({ type: internalActions.DMS_RECEIVED });
				}
				return state;
			}
			return state;
		},
		new Map<string, number>(),
	);

	return {
		socketState,
		updateState,
		socketEventsReceived,
		handleReceivedEvent,
	};
}
