import { useCallback, useEffect, useRef, useState } from "react";
import * as Spotify from "@spotify/web-api-ts-sdk";
import { useLive } from "../LiveContext";
import { SPOTIFY_CLIENT_ID } from "react-native-dotenv";

const clientId = SPOTIFY_CLIENT_ID;
if (!clientId) {
	throw new Error(
		"No Spotify client ID (SPOTIFY_CLIENT_ID) provided in environment variables",
	);
}

export const useSpotifySearch = (): {
	searchResults: Spotify.Track[];
	handleSearch: (query: string) => Promise<void>;
	error: string | null;
} => {
	const { spotifyAuth, currentUser } = useLive();
	const [searchResults, setSearchResults] = useState<Spotify.Track[]>([]);
	const [error, setError] = useState<string | null>(null);
	const spotify = useRef<Spotify.SpotifyApi | null>(null);

	useEffect(() => {
		if (currentUser && currentUser.hasSpotifyAccount) {
			if (spotify != null) {
				spotifyAuth.getSpotifyTokens().then((tokens) => {
					if (tokens !== null) {
						spotify.current = Spotify.SpotifyApi.withAccessToken(
							clientId,
							tokens.tokens,
						);
					}
				});
			}
		}
	}, [currentUser, spotifyAuth]);

	const handleSearch = useCallback(
		async (query: string): Promise<void> => {
			try {
				let client: Spotify.SpotifyApi;
				if (spotify.current !== null) {
					client = spotify.current;
				} else {
					client = spotifyAuth.userlessAPI;
				}
				await client.search(query, ["track"]).then((response) => {
					console.log("search results");
					console.log(response);
					setSearchResults(response.tracks.items);
				});
			} catch (err) {
				setError("An error occurred while searching");
				console.error("Error performing Spotify search: ", err);
			}
		},
		[spotifyAuth.userlessAPI],
	);

	return {
		searchResults,
		handleSearch,
		error,
	};
};
