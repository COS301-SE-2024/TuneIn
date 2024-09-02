// src/services/RoomService.ts
import { Alert } from "react-native";
import uploadImage from "./ImageUpload";
import auth from "./AuthManagement";
import * as utils from "./Utils";
import { RoomDetailsProps } from "../models/roomdetails";

export const createRoom = async (
	roomDetails: RoomDetailsProps,
	image: string | null,
	navigate: (route: { pathname: string; params?: any }) => void,
) => {
	// Create a new room object
	const newRoom: any = {
		has_nsfw_content: roomDetails.isNsfw,
		language: roomDetails.language || "English",
		genre: roomDetails.genre || undefined,
		description: roomDetails.description || "This room has no description.",
		has_explicit_content: roomDetails.isExplicit,
		room_name: roomDetails.name,
	};

	if (!newRoom.room_name) {
		// Alert user to enter room name
		Alert.alert(
			"Room Name Required",
			"Please enter a room name.",
			[{ text: "OK" }],
			{ cancelable: false },
		);
		return;
	}

	// Handle image upload if image is provided
	let imageURL: string = "";

	if (image) {
		imageURL = (await uploadImage(image, roomDetails.name)) || ""; // Provide a default empty string if uploadImage returns undefined
	}
	newRoom["room_image"] = imageURL;
	// Get user authentication token
	const token = await auth.getToken();

	// Make the API request to create a room
	try {
		const response = await fetch(`${utils.API_BASE_URL}/users/rooms`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}` || "",
			},
			body: JSON.stringify(newRoom),
		});
		const data = await response.json();
		navigate({
			pathname: "/screens/Home",
			params: data,
		});
	} catch (error) {
		console.error("Error:", error);
	}
};
