import { ToastAndroid } from "react-native";
import * as utils from "../../../services/Utils";

class CurrentRoom {
	getCurrentRoom = async (token: string) => {
		try {
			const response = await fetch(
				`${utils.API_BASE_URL}/users/rooms/current`,
				{
					method: "GET",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
				},
			);
			if (!response.ok) {
				return null;
			}
			const data = await response.json();
			return data;
		} catch (error) {
			console.log("Error:", error);
			ToastAndroid.show("Failed to load current room", ToastAndroid.SHORT);
		}
	};

	isCurrentRoom = async (
		token: string,
		roomID: string,
	): Promise<boolean | undefined> => {
		try {
			const response = await fetch(
				`${utils.API_BASE_URL}/users/rooms/current`,
				{
					method: "GET",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
				},
			);
			const data = await response.json();
			// if status code is 404, it means there is no current room
			if (!response.ok) {
				return false;
			}
			if (data.room.room_id === roomID) {
				return true;
			}
			return false;
		} catch (error) {
			console.log("Error:", error);
			ToastAndroid.show("Failed to check current room", ToastAndroid.SHORT);
		}
	};

	leaveJoinRoom = async (
		token: string,
		roomID: string,
		isLeaving: boolean,
	): Promise<boolean> => {
		console.log("leaveJoinRoom", token, roomID, isLeaving);
		try {
			const response = await fetch(
				`${utils.API_BASE_URL}/rooms/${roomID}/${isLeaving ? "leave" : "join"}`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
				},
			);
			console.log("Response:", response);
			if (response.ok) {
				return true;
			}
			return false;
		} catch (error) {
			console.log("Error:", error);
			ToastAndroid.show(
				`Failed to ${isLeaving ? "leave" : "join"} room`,
				ToastAndroid.SHORT,
			);
			return false;
		}
	};
}

export default CurrentRoom;
