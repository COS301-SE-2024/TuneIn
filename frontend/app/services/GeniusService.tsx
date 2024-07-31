import Genius from "genius-lyrics";

const Client = new Genius.Client(
	"VYVvaLLxfH1rY8oAYDHzuKKudSNrxNdU8Xf4-UzOAXcg8aE6mM0lppMJb8VCSGwL",
); // Replace with your actual Genius API key

export const fetchLyrics = async (songTitle: string) => {
	try {
		const searches = await Client.songs.search(songTitle);
		if (searches.length > 0) {
			const firstSong = searches[0];
			const lyrics = await firstSong.lyrics();
			return lyrics;
		} else {
			throw new Error("No songs found");
		}
	} catch (error) {
		console.error(error);
		throw new Error("Failed to fetch lyrics");
	}
};

// import Genius from "genius-lyrics";

// import { GENIUS_CLIENT_ID } from "react-native-dotenv";

// const Client = new Genius.Client(GENIUS_CLIENT_ID); // Replace with your actual Genius API key

// export const fetchLyrics = async (songTitle: string) => {
// 	try {
// 		const searches = await Client.songs.search(songTitle);
// 		if (searches.length > 0) {
// 			const firstSong = searches[0];
// 			const lyrics = await firstSong.lyrics();
// 			return lyrics;
// 		} else {
// 			throw new Error("No songs found");
// 		}
// 	} catch (error) {
// 		console.error(error);
// 		throw new Error("Failed to fetch lyrics");
// 	}
// };
