import { SongInfoDto } from "./SongInfoDto";
import { RoomDto } from "./RoomDto";

export type UserDto = {
	profile_name: string;
	userID: string;
	username: string;
	profile_picture_url: string;
	followers: {
		count: number;
		data: UserDto[];
	};
	following: {
		count: number;
		data: UserDto[];
	};
	links: {
		count: number;
		data: string[];
	};
	bio: string;
	current_song: SongInfoDto;
	fav_genres: {
		count: number;
		data: string[];
	};
	fav_songs: {
		count: number;
		data: SongInfoDto[];
	};
	fav_rooms: {
		count: number;
		data: RoomDto[];
	};
	recent_rooms: {
		count: number;
		data: RoomDto[];
	};
	friendship?: {
		status: boolean;
		accept_url: string;
		reject_url: string;
	};
};
