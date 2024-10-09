import * as Spotify from "@spotify/web-api-ts-sdk";
import { RoomSongDto } from "../../api";

export type SongPair = {
	song: RoomSongDto;
	track: Spotify.Track;
};

export const constructArtistString = (song: SongPair | undefined) => {
	if (!song || !song.track || !song.track.artists) {
		return "Artist Name";
	}

	const artists: Spotify.SimplifiedArtist[] = song.track.artists;
	if (!artists || artists.length === 0) {
		return "Artist Name";
	}
	let artistString = "";
	artists.forEach((artist, index) => {
		artistString += artist.name;
		if (index < artists.length - 1) {
			artistString += ", ";
		}
	});
	return artistString;
};

export const getAlbumArtUrl = (song: SongPair | undefined) => {
	if (!song || !song.track || !song.track.album) {
		return "https://www.wagbet.com/wp-content/uploads/2019/11/music_placeholder.png";
	}

	if (
		song.track.album &&
		song.track.album.images &&
		song.track.album.images.length > 0
	) {
		return song.track.album.images[0].url;
	}
	return "https://www.wagbet.com/wp-content/uploads/2019/11/music_placeholder.png";
};

export const getTitle = (song: SongPair | undefined) => {
	if (!song || !song.track || !song.track.name) {
		return "Song Title";
	}
	return song.track.name;
};

export const getID = (song: SongPair | undefined) => {
	if (!song || !song.track || !song.track.id) {
		return "";
	}
	return song.track.id;
};

export const getExplicit = (song: SongPair | undefined) => {
	if (!song || !song.track) {
		return false;
	}
	return song.track.explicit;
};

export const convertQueue = (
	queue: RoomSongDto[],
	tracks: Spotify.Track[],
): SongPair[] => {
	const result: SongPair[] = [];
	for (let i = 0, n = queue.length; i < n; i++) {
		result.push({ song: queue[i], track: tracks[i] });
	}
	return result;
};
