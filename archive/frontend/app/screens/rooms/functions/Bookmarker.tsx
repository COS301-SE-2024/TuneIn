import { ToastAndroid } from "react-native";
import * as utils from "../../../services/Utils";

class Bookmarker {
	checkBookmark = async (token: string, roomID: string) => {
		try {
			const response = await fetch(`${utils.API_BASE_URL}/users/bookmarks`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
			});
			const data = await response.json();
			// check whether the room is bookmarked or not
			for (let i = 0; i < data.length; i++) {
				if (data[i].roomID === roomID) {
					console.log("Room is bookmarked");
					return true;
				}
			}
			console.log(data);
		} catch (error) {
			console.log("Error:", error);
			ToastAndroid.show("Failed to check bookmark", ToastAndroid.SHORT);
		}
	};

	handleBookmark = async (
		token: string,
		roomID: string,
		isBookmarked: boolean,
	) => {
		// make a request to the backend to check if the room is bookmarked

		try {
			console.log(roomID);
			const response = await fetch(
				`${utils.API_BASE_URL}/rooms/${roomID}/${isBookmarked ? "unbookmark" : "bookmark"}`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
				},
			);
			console.log(response);
			if (response.status === 201) {
				return true;
			}
			return false;
		} catch (error) {
			console.log("Error:", error);
			ToastAndroid.show(
				`Failed to ${isBookmarked ? "unbookmark" : "bookmark"}`,
				ToastAndroid.SHORT,
			);
		}
	};
}

export default Bookmarker;
