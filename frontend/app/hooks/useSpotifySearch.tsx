import { useCallback, useState } from "react";
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

	const handleSearch = useCallback(
		async (query: string): Promise<void> => {
			try {
				await spotifyAuth.userlessAPI
					.search(query, ["track"])
					.then((response) => {
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
