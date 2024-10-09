import { useCallback, useEffect, useRef, useState } from "react";
import * as Spotify from "@spotify/web-api-ts-sdk";
import { SpotifyAuth } from "../LiveContext";
import * as StorageService from "../services/StorageService";

const RETRIES = 3;

export const useSpotifyTracks = (
	spotifyAuth: SpotifyAuth,
): {
	addSongsToCache: (songs: Spotify.Track[]) => Promise<void>;
	fetchSongInfo: (songIDs: string[]) => Promise<Spotify.Track[]>;
} => {
	const spotify = useRef<Spotify.SpotifyApi>(spotifyAuth.userlessAPI);
	const [cachedSongs, setCachedSongs] = useState<Spotify.Track[]>([]);

	const initialise = useCallback(async () => {
		const songs: string | null = await StorageService.getItem("cachedSongs");
		if (songs !== null) {
			setCachedSongs(JSON.parse(songs));
		} else {
			setCachedSongs([]);
			await StorageService.setItem("cachedSongs", JSON.stringify([]));
		}
	}, []);

	const addSongsToCache = useCallback(
		async (songs: Spotify.Track[]): Promise<void> => {
			const newSongs = songs.filter(
				(song) => !cachedSongs.find((s) => s.id === song.id),
			);
			if (newSongs.length > 0) {
				console.log(`Adding ${newSongs.length} new songs to cache`);
				setCachedSongs([...cachedSongs, ...newSongs]);
				await StorageService.setItem(
					"cachedSongs",
					JSON.stringify([...cachedSongs, ...newSongs]),
				);
			}
		},
		[cachedSongs],
	);

	const fetchSongInfo = useCallback(
		async (songIDs: string[]): Promise<Spotify.Track[]> => {
			if (songIDs.length > 0) {
				const songs = cachedSongs.filter((song) => songIDs.includes(song.id));
				const notFoundIDs = songIDs.filter(
					(id) => !songs.map((song) => song.id).includes(id),
				);
				if (notFoundIDs.length > 0) {
					console.log("Fetching song info from Spotify API");
					for (let i = 0; i < RETRIES; i++) {
						try {
							const newSongs: Spotify.Track[] = [];
							for (let j = 0; j < notFoundIDs.length; j += 50) {
								const tracks = await spotify.current.tracks.get(
									notFoundIDs.slice(j, j + 50),
								);
								newSongs.push(...tracks);
							}
							songs.push(...newSongs);
							break;
						} catch (err) {
							console.error("Error fetching song info from Spotify API: ", err);
						}
						await new Promise((resolve) =>
							setTimeout(resolve, 1000 * Math.pow(2, i)),
						);
					}
				}

				//ensure result is ordered the same as input
				const result: Spotify.Track[] = [];
				for (let i = 0; i < songIDs.length; i++) {
					const s = songs.find((song) => song.id === songIDs[i]);
					if (!s) {
						console.error(`Song with ID ${songIDs[i]} not found`);
						return [];
					}
					result.push(s);
				}
				await addSongsToCache(result);
				return result;
			}
			return [];
		},
		[addSongsToCache, cachedSongs],
	);

	// on component mount
	useEffect(() => {
		initialise();
	}, []);

	useEffect(() => {
		if (spotify.current !== spotifyAuth.userlessAPI) {
			console.log(`Updating local Spotify client with userless API`);
			spotify.current = spotifyAuth.userlessAPI;
		}
	}, [spotifyAuth.userlessAPI]);

	return {
		addSongsToCache,
		fetchSongInfo,
	};
};
