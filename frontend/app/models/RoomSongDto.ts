import { Track } from "@spotify/web-api-ts-sdk";

export type RoomSongDto = {
	spotifyID: string;
	userID: string;
	score?: number;
	startTime?: Date;
	track?: Track;
};
