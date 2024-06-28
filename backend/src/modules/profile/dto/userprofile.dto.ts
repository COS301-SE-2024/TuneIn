import { ApiProperty } from "@nestjs/swagger";
import { IsString, ValidateNested, IsObject } from "class-validator";
import { RoomDto } from "../../../modules/rooms/dto/room.dto";
import { SongInfoDto } from "../../../modules/rooms/dto/songinfo.dto";

export class UserProfileDto {
	@ApiProperty()
	@IsString()
	profile_name: string;

	@ApiProperty()
	@IsString()
	userID: string;

	@ApiProperty()
	@IsString()
	username: string;

	@ApiProperty()
	@IsString()
	profile_picture_url: string;

	@ApiProperty()
	@IsObject()
	@ValidateNested()
	followers: {
		count: number;
		data: UserProfileDto[];
	};

	@ApiProperty()
	@IsObject()
	@ValidateNested()
	following: {
		count: number;
		data: UserProfileDto[];
	};

	@ApiProperty()
	@IsObject()
	@ValidateNested()
	links: {
		count: number;
		data: string[];
	};

	@ApiProperty()
	@IsString()
	bio: string;

	@ApiProperty()
	@IsObject()
	@ValidateNested()
	current_song: SongInfoDto;

	@ApiProperty()
	@IsObject()
	@ValidateNested()
	fav_genres: {
		count: number;
		data: string[];
	};

	@ApiProperty()
	@IsObject()
	@ValidateNested()
	fav_songs: {
		count: number;
		data: SongInfoDto[];
	};

	@ApiProperty()
	@IsObject()
	@ValidateNested()
	fav_rooms: {
		count: number;
		data: RoomDto[];
	};

	@ApiProperty()
	@IsObject()
	@ValidateNested()
	recent_rooms: {
		count: number;
		data: RoomDto[];
	};
}
