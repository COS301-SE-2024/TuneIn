import { ApiProperty } from "@nestjs/swagger";
import { UserProfileDto } from "../dto/userprofile.dto";
import { RoomDto } from "../../rooms/dto/room.dto";
import { SongInfoDto } from "../../rooms/dto/songinfo.dto";

export class UserEntity {
	@ApiProperty()
	profile_name: string;

	@ApiProperty()
	user_id: string;

	@ApiProperty()
	username: string;

	@ApiProperty()
	profile_picture_url: string;

	@ApiProperty()
	followers: {
		count: number;
		data: UserProfileDto[];
	};

	@ApiProperty()
	following: {
		count: number;
		data: UserProfileDto[];
	};

	@ApiProperty()
	links: {
		count: number;
		data: string[];
	};

	@ApiProperty()
	bio: string;

	@ApiProperty()
	current_song: SongInfoDto;

	@ApiProperty()
	fav_genres: {
		count: number;
		data: string[];
	};

	@ApiProperty()
	fav_songs: {
		count: number;
		data: SongInfoDto[];
	};

	@ApiProperty()
	fav_rooms: {
		count: number;
		data: RoomDto[];
	};

	@ApiProperty()
	recent_rooms: {
		count: number;
		data: RoomDto[];
	};
}
