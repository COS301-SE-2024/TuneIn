import { RoomSongDto } from "./RoomSongDto";

export type PlaybackEventDto = {
	date_created?: Date;
	userID: string | null;
	roomID: string;
	spotifyID: string | null;
	song?: RoomSongDto | null;
	UTC_time: number | null;
	errorMessage?: string;
};
