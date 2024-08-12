import { RoomSongDto } from "./RoomSongDto";

export type QueueEventDto = {
	song: RoomSongDto;
	roomID: string;
	createdAt?: Date;
};
