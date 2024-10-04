import { RoomSongDto } from "../../api";

export type QueueEventDto = {
	songs: RoomSongDto[];
	roomID: string;
	createdAt?: Date;
};
