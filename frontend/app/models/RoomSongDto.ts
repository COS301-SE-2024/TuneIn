import { Track } from "@spotify/web-api-ts-sdk";
import * as Spotify from "@spotify/web-api-ts-sdk";

export const constructArtistString = (song: RoomSongDto | undefined) => {
	if (!song) {
		return "";
	}

	const track: Spotify.Track | undefined = song.track;
	if (!track) {
		return "";
	}

	const artists: Spotify.SimplifiedArtist[] | undefined = track?.artists;
	if (!artists) {
		return "";
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

export const getAlbumArtUrl = (song: RoomSongDto | undefined) => {
	if (!song) {
		return "";
	}

	const track: Spotify.Track | undefined = song.track;
	if (!track) {
		return "";
	}
	if (track.album && track.album.images && track.album.images.length > 0) {
		return track.album.images[0].url;
	}
	return "";
};

export const getTitle = (song: RoomSongDto | undefined) => {
	if (!song) {
		return "";
	}

	const track: Spotify.Track | undefined = song.track;
	if (!track) {
		return "";
	}
	return track.name;
};

export const getID = (song: RoomSongDto | undefined) => {
	if (!song) {
		return "";
	}

	const track: Spotify.Track | undefined = song.track;
	if (!track) {
		return "";
	}
	return track.id;
};

export const getExplicit = (song: RoomSongDto | undefined) => {
	if (!song) {
		return false;
	}

	const track: Spotify.Track | undefined = song.track;
	if (!track) {
		return false;
	}
	return track.explicit;
};

export type RoomSongDto = {
	spotifyID: string;
	userID: string;
	score?: number;
	startTime?: Date;
	track?: Track;
};
