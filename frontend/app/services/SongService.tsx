import axios from "axios";
import * as utils from "./Utils";

class SongService {
	public async getSpotifyID(songID: string): Promise<string> {
		try {
			const response = await axios.get(
				`${utils.API_BASE_URL}/songs/${songID}/spotify`,
			);
			return response.data.id;
		} catch (error) {
			console.error("Error fetching user's own info:", error);
			throw error;
		}
	}
}

export default new SongService();
