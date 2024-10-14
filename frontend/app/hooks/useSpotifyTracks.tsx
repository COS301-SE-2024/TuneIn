import { useCallback, useEffect, useRef, useState } from "react";
import * as Spotify from "@spotify/web-api-ts-sdk";
import { SpotifyAuth } from "../LiveContext";
import { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } from "react-native-dotenv";

// const RETRIES = 3;

export const useSpotifyTracks = (
	spotifyAuth: SpotifyAuth,
): {
	addSongsToCache: (songs: Spotify.Track[]) => Promise<void>;
	fetchSongInfo: (songIDs: string[]) => Promise<Spotify.Track[]>;
} => {
	// const spotify = useRef<Spotify.SpotifyApi>();
	// const [cachedSongs, setCachedSongs] = useState<Spotify.Track[]>([]);
	const cachedSongsRef = useRef<Map<string, Spotify.Track>>(new Map());
	const spotifyTokens = useRef<Spotify.AccessToken>();

	const fetchSpotifyTokens = useCallback(async () => {
		return fetch("https://accounts.spotify.com/api/token", {
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
				Authorization:
					"Basic " + btoa(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`),
			},
			body: "grant_type=client_credentials",
		})
			.then((res) => res.json())
			.then((tokens) => {
				console.log(`Got userless API tokens:`, tokens);
				spotifyTokens.current = tokens;
				return tokens;
			})
			.catch((error) => {
				console.error("Failed to get userless API:", error);
				throw error;
			});
	}, []);

	// const updateAPIClient = useCallback(async () => {
	// 	const api: Spotify.SpotifyApi = await spotifyAuth.getUserlessAPI();
	// 	if (
	// 		!spotify.current ||
	// 		(await spotify.current.getAccessToken()) !== (await api.getAccessToken())
	// 	) {
	// 		console.log(`Updating local Spotify client with userless API`);
	// 		spotify.current = api;
	// 	}
	// }, [spotifyAuth]);

	const addSongsToCache = useCallback(
		async (songs: Spotify.Track[]): Promise<void> => {
			// const newSongs = songs.filter(
			// 	(song) => !cachedSongs.find((s) => s.id === song.id),
			// );
			// if (newSongs.length > 0) {
			// 	console.log(`Adding ${newSongs.length} new songs to cache`);
			// 	setCachedSongs([...cachedSongs, ...newSongs]);
			// }
			songs.forEach((song) => {
				if (!cachedSongsRef.current.has(song.id)) {
					cachedSongsRef.current.set(song.id, song);
				}
			});
		},
		[],
	);

	const fetchSongInfo = useCallback(
		async (songIDs: string[]): Promise<Spotify.Track[]> => {
			// let localAPI: Spotify.SpotifyApi;
			// if (!spotify.current) {
			// 	// await updateAPIClient();
			// 	localAPI = await spotifyAuth.getUserlessAPI();
			// 	spotify.current = localAPI;
			// } else {
			// 	localAPI = spotify.current;
			// }
			// console.log(await localAPI.getAccessToken());
			// if (songIDs.length > 0) {
			// 	const songs = cachedSongs.filter((song) => songIDs.includes(song.id));
			// 	const notFoundIDs = songIDs.filter(
			// 		(id) => !songs.map((song) => song.id).includes(id),
			// 	);
			// 	if (notFoundIDs.length > 0) {
			// 		console.log("Fetching song info from Spotify API");
			// 		for (let i = 0; i < RETRIES; i++) {
			// 			try {
			// 				const newSongs: Spotify.Track[] = [];
			// 				for (let j = 0; j < notFoundIDs.length; j += 50) {
			// 					const tracks = await localAPI.tracks.get(
			// 						notFoundIDs.slice(j, j + 50),
			// 					);
			// 					newSongs.push(...tracks);
			// 				}
			// 				songs.push(...newSongs);
			// 				break;
			// 			} catch (err) {
			// 				console.error("Error fetching song info from Spotify API: ", err);
			// 			}
			// 			await new Promise((resolve) =>
			// 				setTimeout(resolve, 1000 * Math.pow(2, i)),
			// 			);
			// 		}
			// 	}

			// 	//ensure result is ordered the same as input
			// 	const result: Spotify.Track[] = [];
			// 	for (let i = 0; i < songIDs.length; i++) {
			// 		const s = songs.find((song) => song.id === songIDs[i]);
			// 		if (!s) {
			// 			console.error(`Song with ID ${songIDs[i]} not found`);
			// 			return [];
			// 		}
			// 		result.push(s);
			// 	}
			// 	await addSongsToCache(result);
			// 	return result;
			// }
			// return [];
			const notCachedIDs: string[] = [];
			const notCached: Spotify.Track[] = [];
			songIDs.forEach((id) => {
				if (!cachedSongsRef.current.has(id)) {
					notCachedIDs.push(id);
				}
			});
			if (notCachedIDs.length > 0) {
				let tokens: Spotify.AccessToken;
				if (!spotifyTokens.current) {
					tokens = await fetchSpotifyTokens();
					spotifyTokens.current = tokens;
				} else {
					tokens = spotifyTokens.current;
				}
				const url = `https://api.spotify.com/v1/tracks?ids=${notCachedIDs.join(",")}`;
				console.log(`Fetching song info from Spotify API: ${url}`);
				console.log(`Using tokens: ${tokens}`);
				await fetch(url, {
					headers: {
						Authorization: `Bearer ${tokens.access_token}`,
					},
				})
					.then((res) => res.json())
					.then(async (data) => {
						console.log(data);
						notCached.push(...data.tracks);
						await addSongsToCache(notCached);
					});
			}
			return songIDs.map((id) => cachedSongsRef.current.get(id)!);
		},
		[addSongsToCache, fetchSpotifyTokens],
	);

	// on component mount
	useEffect(() => {
		// updateAPIClient();
	}, []);

	// useEffect(() => {
	// 	updateAPIClient();
	// }, [spotifyAuth.userlessAPIExpiry, updateAPIClient]);

	return {
		addSongsToCache,
		fetchSongInfo,
	};
};
