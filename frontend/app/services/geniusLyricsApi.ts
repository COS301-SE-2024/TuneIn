import axios from "axios";

interface GeniusLyricsOptions {
	apiKey: string;
	title: string;
	artist: string;
	optimizeQuery?: boolean;
}

export const getLyrics = async (
	options: GeniusLyricsOptions,
): Promise<string | null> => {
	const { apiKey, title, artist } = options;
	const url = `https://api.genius.com/search?q=${encodeURIComponent(`${artist} ${title}`)}&access_token=${apiKey}`;

	try {
		const response = await axios.get(url);
		const song = response.data.response.hits[0]?.result;
		if (!song) {
			return null;
		}
		const songUrl = `https://api.genius.com/songs/${song.id}?access_token=${apiKey}`;
		const songDetails = await axios.get(songUrl);
		return songDetails.data.response.song.lyrics;
	} catch (error) {
		console.error("Error fetching lyrics:", error);
		return null;
	}
};

// import axios from "axios";
// // import { GENIUS_API_KEY } from "@env";

// const API_BASE_URL = "https://api.genius.com";

// const headers = {
// 	Authorization: `Bearer ${"lmMAkitsojSrSIKljAIbMWAnwgjdfXD-rgrOF149exXb2riwkw9ERs9jsmorrZqJ"}`,
// };

// export const fetchLyrics = async (songTitle: string) => {
// 	try {
// 		const response = await axios.get(`${API_BASE_URL}/search`, {
// 			headers,
// 			params: { q: songTitle },
// 		});

// 		const song = response.data.response.hits[0]?.result;
// 		if (!song) {
// 			throw new Error("No songs found");
// 		}

// 		const songId = song.id;
// 		const songDetails = await axios.get(`${API_BASE_URL}/songs/${songId}`, {
// 			headers,
// 		});

// 		const lyricsPath = songDetails.data.response.song.url;
// 		return { song, lyricsPath };
// 	} catch (error) {
// 		console.error(error);
// 		throw new Error("Failed to fetch lyrics");
// 	}
// };

// // import Genius from "genius-lyrics";

// // const Client = new Genius.Client(
// // 	"VYVvaLLxfH1rY8oAYDHzuKKudSNrxNdU8Xf4-UzOAXcg8aE6mM0lppMJb8VCSGwL",
// // ); // Replace with your actual Genius API key

// // export const fetchLyrics = async (songTitle: string) => {
// // 	try {
// // 		const searches = await Client.songs.search(songTitle);
// // 		if (searches.length > 0) {
// // 			const firstSong = searches[0];
// // 			const lyrics = await firstSong.lyrics();
// // 			return lyrics;
// // 		} else {
// // 			throw new Error("No songs found");
// // 		}
// // 	} catch (error) {
// // 		console.error(error);
// // 		throw new Error("Failed to fetch lyrics");
// // 	}
// // };

// // import Genius from "genius-lyrics";

// // import { GENIUS_CLIENT_ID } from "react-native-dotenv";

// // const Client = new Genius.Client(GENIUS_CLIENT_ID); // Replace with your actual Genius API key

// // export const fetchLyrics = async (songTitle: string) => {
// // 	try {
// // 		const searches = await Client.songs.search(songTitle);
// // 		if (searches.length > 0) {
// // 			const firstSong = searches[0];
// // 			const lyrics = await firstSong.lyrics();
// // 			return lyrics;
// // 		} else {
// // 			throw new Error("No songs found");
// // 		}
// // 	} catch (error) {
// // 		console.error(error);
// // 		throw new Error("Failed to fetch lyrics");
// // 	}
// // };
