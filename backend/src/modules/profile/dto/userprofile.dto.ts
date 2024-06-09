import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, IsInt, ValidateNested } from "class-validator";
import { RoomDto } from "src/modules/rooms/dto/room.dto";
import { SongInfoDto } from "src/modules/rooms/dto/song-info.dto";

export class UserProfileDto {
	@ApiProperty()
	@IsString()
	profile_name: string;

	@ApiProperty()
	@IsString()
	user_id: string;

	@ApiProperty()
	@IsString()
	username: string;

	@ApiProperty()
	@IsString()
	profile_picture_url: string;

	@ApiProperty()
	@IsInt()
	followers: {
		count: number;
		data: ProfileDto[];
	};

	@ApiProperty()
	@IsInt()
	following: {
		count: number;
		data: ProfileDto[];
	};

	@ApiProperty()
	@IsInt()
	links: {
		count: number;
		data: string[];
	};

	@ApiProperty()
	@IsString()
	bio: string;

	@ApiProperty()
	@ValidateNested()
	current_song: SongInfoDto;

	@ApiProperty()
	@IsInt()
	fav_genres: {
		count: number;
		data: string[];
	};

	@ApiProperty()
	@IsInt()
	fav_songs: {
		count: number;
		data: SongInfoDto[];
	};

	@ApiProperty()
	@IsInt()
	fav_rooms: {
		count: number;
		data: RoomDto[];
	};

	@ApiProperty()
	@IsInt()
	recent_rooms: {
		count: number;
		data: RoomDto[];
	};
}
