import { useState } from "react";
import * as Spotify from "@spotify/web-api-ts-sdk";
import { useLive } from "../LiveContext";

export const useSpotifySearch = (): {
	searchResults: Spotify.Track[];
	handleSearch: (query: string) => Promise<void>;
	error: string | null;
} => {
	const { spotifyAuth } = useLive();
	const [searchResults, setSearchResults] = useState<Spotify.Track[]>([]);
	const [error, setError] = useState<string | null>(null);

	const handleSearch = async (query: string): Promise<void> => {
		try {
			await spotifyAuth.userlessAPI
				.search(query, ["track"])
				.then((response) => {
					console.log("response", response);
					setSearchResults(response.tracks.items);
				});
		} catch (err) {
			setError("An error occurred while searching");
			console.error("Error performing Spotify search: ", err);
		}
	};

	return {
		searchResults,
		handleSearch,
		error,
	};
};
