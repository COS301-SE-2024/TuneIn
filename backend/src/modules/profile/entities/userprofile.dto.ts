import { ApiProperty } from "@nestjs/swagger";
import { ProfileDto } from "./profile.dto";
import { RoomDto } from "./room.dto";
import { SongInfoDto } from "./song-info.dto";

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
		data: ProfileDto[];
	};

	@ApiProperty()
	following: {
		count: number;
		data: ProfileDto[];
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
