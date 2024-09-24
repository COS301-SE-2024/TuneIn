import { useState } from "react";
import * as spotifyAuth from "../services/SpotifyAuth";
import { ToastAndroid } from "react-native";

export const useSpotifySearch = () => {
	const [searchResults, setSearchResults] = useState<any[]>([]);
	const [error, setError] = useState<string | null>(null);
	const handleSearch = async (query: string) => {
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

			const data = await response.json();
			setSearchResults(data.tracks.items);
		} catch (err) {
			setError("An error occurred while searching");
			console.log("An error occurred while searching", err);
			ToastAndroid.show("Failed to load search results", ToastAndroid.SHORT);
		}
	};

	return {
		searchResults,
		handleSearch,
		error,
	};
};
