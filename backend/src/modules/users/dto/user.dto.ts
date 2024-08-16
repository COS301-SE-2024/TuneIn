import { ApiProperty } from "@nestjs/swagger";
import { IsString, ValidateNested, IsObject } from "class-validator";
import { RoomDto } from "../../rooms/dto/room.dto";
import { SongInfoDto } from "../../rooms/dto/songinfo.dto";

export class UserDto {
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
		data: UserDto[];
	};

	@ApiProperty()
	@IsObject()
	@ValidateNested()
	following: {
		count: number;
		data: UserDto[];
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

	@ApiProperty()
	@IsObject()
	@ValidateNested()
	friendship?: {
		status: boolean;
		accept_url: string;
		reject_url: string;
	};

	// optional field for relationship status
	@ApiProperty()
	@IsString()
	relationship?:
		| "following"
		| "follower"
		| "mutual"
		| "friend"
		| "pending"
		| "none";
}
