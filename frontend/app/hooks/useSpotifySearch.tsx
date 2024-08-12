import { useState } from "react";
import * as spotifyAuth from "../services/SpotifyAuth";
import * as Spotify from "@spotify/web-api-ts-sdk";

export const useSpotifySearch = (): {
	searchResults: Spotify.Track[];
	handleSearch: (query: string) => Promise<void>;
	error: string | null;
} => {
	const [searchResults, setSearchResults] = useState<Spotify.Track[]>([]);
	const [error, setError] = useState<string | null>(null);
	const handleSearch = async (query: string): Promise<void> => {
		try {
			console.log("handleSearch: ", query);
			const allTokens = await spotifyAuth.getTokens();
			const accessToken = allTokens.access_token;

			if (!accessToken) {
				throw new Error("Access token not found");
			}

			const response = await fetch(
				`https://api.spotify.com/v1/search?q=${query}&type=track`,
				{
					method: "GET",
					headers: {
						Authorization: `Bearer ${accessToken}`,
						"Content-Type": "application/json",
					},
				},
			);

			if (!response.ok) {
				throw new Error(`HTTP error! Status: ${response.status}`);
			}

			const data = (await response.json()) as Required<
				Pick<Spotify.PartialSearchResult, "tracks">
			>;
			setSearchResults(data.tracks.items);
		} catch (err) {
			setError("An error occurred while searching");
			console.error("An error occurred while searching", err);
		}
	};

	return {
		searchResults,
		handleSearch,
		error,
	};
};
