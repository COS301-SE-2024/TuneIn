import axios from "axios";
import { ToastAndroid } from "react-native";
import * as utils from "./Utils";

class SongService {
	public async getSpotifyID(songID: string): Promise<string> {
		try {
			const response = await axios.get(
				`${utils.API_BASE_URL}/songs/${songID}/spotify`,
			);
			return response.data.id;
		} catch (error) {
			console.log("Error fetching user's own info:", error);
			ToastAndroid.show("Failed to get song's spotify id", ToastAndroid.SHORT);
			throw error;
		}
	}
}

export default new SongService();
