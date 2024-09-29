import { Track } from "@spotify/web-api-ts-sdk";
import * as Spotify from "@spotify/web-api-ts-sdk";

export const constructArtistString = (song: RoomSongDto | undefined) => {
	if (!song) {
		return "Artist Name";
	}

	const track: Spotify.Track | undefined = song.track;
	if (!track) {
		return "Artist Name";
	}

	const artists: Spotify.SimplifiedArtist[] | undefined = track?.artists;
	if (!artists) {
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

export const getAlbumArtUrl = (song: RoomSongDto | undefined) => {
	if (!song) {
		return "https://www.wagbet.com/wp-content/uploads/2019/11/music_placeholder.png";
	}

	const track: Spotify.Track | undefined = song.track;
	if (!track) {
		return "https://www.wagbet.com/wp-content/uploads/2019/11/music_placeholder.png";
	}
	if (track.album && track.album.images && track.album.images.length > 0) {
		return track.album.images[0].url;
	}
	return "https://www.wagbet.com/wp-content/uploads/2019/11/music_placeholder.png";
};

export const getTitle = (song: RoomSongDto | undefined) => {
	if (!song) {
		return "Song Title";
	}

	const track: Spotify.Track | undefined = song.track;
	if (!track) {
		return "Song Title";
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
	score: number;
	index: number;
	startTime?: Date;
	insertTime: Date;
	pauseTime?: Date;
	track: Track;
	playlistIndex: number;
};
