import { useState } from "react";
import * as Spotify from "@spotify/web-api-ts-sdk";
import { useLive } from "../LiveContext";
import { SpotifyTokenPair, SpotifyTokenResponse } from "../../api";

export const useSpotifySearch = (): {
	searchResults: Spotify.Track[];
	handleSearch: (query: string) => Promise<void>;
	error: string | null;
} => {
	const { spotifyAuth } = useLive();
	const [searchResults, setSearchResults] = useState<Spotify.Track[]>([]);
	const [error, setError] = useState<string | null>(null);

	const fetchToken = async (): Promise<string> => {
		try {
			const tp: SpotifyTokenPair | null = await spotifyAuth.getSpotifyTokens();
			if (!tp) {
				throw new Error("No tokens found");
			}
			const tokens: SpotifyTokenResponse = tp.tokens;
			const token = tokens.access_token;
			console.log("allTokens: ", tokens, "\ntoken: ", token);
			return token;
		} catch (err) {
			setError("An error occurred while fetching the token");
			console.error("An error occurred while fetching the token", err);
			throw err;
		}
	};

	const handleSearch = async (query: string): Promise<void> => {
		try {
			fetchToken().then(async (token) => {
				console.log("handleSearch: ", query);
				const response = await fetch(
					`https://api.spotify.com/v1/search?q=${query}&type=track`,
					{
						method: "GET",
						headers: {
							Authorization: `Bearer ${token}`,
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
			});
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
