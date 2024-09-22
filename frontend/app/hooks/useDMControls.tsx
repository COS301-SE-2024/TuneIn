import { useCallback, useEffect, useMemo } from "react";
import { Socket } from "socket.io-client";
import { DirectMessageDto, LiveChatMessageDto, UserDto } from "../../api";
import { SPOTIFY_CLIENT_ID } from "react-native-dotenv";
import { SOCKET_EVENTS } from "../../constants";
import { actionTypes, useLiveState } from "../hooks/useSocketState";

const clientId = SPOTIFY_CLIENT_ID;
if (!clientId) {
	throw new Error(
		"No Spotify client ID (SPOTIFY_CLIENT_ID) provided in environment variables",
	);
}

export type DirectMessage = {
	message: DirectMessageDto;
	me?: boolean;
	messageSent: boolean;
	isOptimistic: boolean;
};

export interface DirectMessageControls {
	sendDirectMessage: (message: DirectMessage) => void;
	editDirectMessage: (message: DirectMessage) => void;
	deleteDirectMessage: (message: DirectMessage) => void;
	requestDirectMessageHistory: () => void;
}
interface DmControlProps {
	currentUser: UserDto | undefined;
	dmParticipants: UserDto[];
	socket: Socket | null;
	pollLatency: () => void;
}

export function useDirectMessageControls({
	currentUser,
	dmParticipants,
	getSocket,
	pollLatency,
}: DmControlProps): DirectMessageControls {
	console.log("useDirectMessageControls()");
	const { socketState, updateState } = useLiveState();
	const sendDirectMessage = useCallback(
		function (message: DirectMessage): void {
			const socket = getSocket();
			if (!socket) {
				console.error("Socket connection not initialized");
				return;
			}

			pollLatency();
			if (!currentUser) {
				console.error("User is not logged in");
				return;
			}

			if (dmParticipants.length === 0) {
				console.error("User is not sending a message to anyone");
				return;
			}

			if (message.message.messageBody.trim()) {
				message.message.sender = currentUser;
				message.message.recipient = dmParticipants[0];
				socket.emit(
					SOCKET_EVENTS.DIRECT_MESSAGE,
					JSON.stringify(message.message),
				);
			}
		},
		[currentUser, dmParticipants, getSocket, pollLatency],
	);

	useEffect(() => {
		console.log("sendDirectMessage function has been recreated");
	}, [sendDirectMessage]);

	const editDirectMessage = useCallback(
		function (message: DirectMessage): void {
			const socket = getSocket();
			if (!socket) {
				console.error("Socket connection not initialized");
				return;
			}

			pollLatency();
			if (!currentUser) {
				console.error("User is not logged in");
				return;
			}

			if (dmParticipants.length === 0) {
				console.error("User is not sending a message to anyone");
				return;
			}

			if (message.message.messageBody.trim()) {
				let payload = {
					userID: currentUser.userID,
					participantID: dmParticipants[0].userID,
					action: "edit",
					message: message.message,
				};
				socket.emit(SOCKET_EVENTS.MODIFY_DM, JSON.stringify(payload));
			}
		},
		[currentUser, dmParticipants, getSocket, pollLatency],
	);

	useEffect(() => {
		console.log("editDirectMessage function has been recreated");
	}, [editDirectMessage]);

	const deleteDirectMessage = useCallback(
		function (message: DirectMessage): void {
			const socket = getSocket();
			if (!socket) {
				console.error("Socket connection not initialized");
				return;
			}

			if (!currentUser) {
				console.error("User is not logged in");
				return;
			}

			if (dmParticipants.length === 0) {
				console.error("User is not sending a message to anyone");
				return;
			}

			let payload = {
				userID: currentUser.userID,
				participantID: dmParticipants[0].userID,
				action: "delete",
				message: message.message,
			};
			socket.emit(SOCKET_EVENTS.MODIFY_DM, JSON.stringify(payload));
		},
		[currentUser, dmParticipants, getSocket],
	);

	useEffect(() => {
		console.log("deleteDirectMessage function has been recreated");
	}, [deleteDirectMessage]);

	const requestDirectMessageHistory = useCallback(
		function (): void {
			const socket = getSocket();
			if (!socket) {
				console.error("Socket connection not initialized");
				return;
			}

			if (socketState.dmsRequested) {
				console.log("Already requested DM history");
				return;
			}

			if (!currentUser) {
				console.error("User is not logged in");
				return;
			}

			if (dmParticipants.length === 0) {
				console.error("User is not sending a message to anyone");
				return;
			}

			const input = {
				userID: currentUser.userID,
				participantID: dmParticipants[0].userID,
			};
			socket.emit(
				SOCKET_EVENTS.GET_DIRECT_MESSAGE_HISTORY,
				JSON.stringify(input),
			);
			updateState({ type: actionTypes.DMS_REQUESTED });
		},
		[currentUser, dmParticipants, getSocket, socketState, updateState],
	);

	useEffect(() => {
		console.log("requestDirectMessageHistory function has been recreated");
	}, [requestDirectMessageHistory]);

	const dmControls = useMemo(() => {
		return {
			sendDirectMessage,
			editDirectMessage,
			deleteDirectMessage,
			requestDirectMessageHistory,
		};
	}, [
		deleteDirectMessage,
		editDirectMessage,
		requestDirectMessageHistory,
		sendDirectMessage,
	]);
	return dmControls;
}
