import { SongInfoDto } from "./SongInfoDto";
import { UserDto } from "./UserDto";

export type RoomDto = {
	creator: UserDto;
	roomID: string;
	participant_count: number;
	room_name: string;
	description: string;
	is_temporary: boolean;
	is_private: boolean;
	is_scheduled: boolean;
	start_date: Date;
	end_date: Date;
	language: string;
	has_explicit_content: boolean;
	has_nsfw_content: boolean;
	room_image: string;
	current_song: SongInfoDto;
	tags: string[];
};
