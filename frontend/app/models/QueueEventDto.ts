import { RoomSongDto } from "./RoomSongDto";

export type QueueEventDto = {
	songs: RoomSongDto[];
	roomID: string;
	createdAt?: Date;
};
