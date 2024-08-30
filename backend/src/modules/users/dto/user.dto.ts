import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, ValidateNested, IsObject } from "class-validator";
import { RoomDto } from "../../rooms/dto/room.dto";
import { SongInfoDto } from "../../rooms/dto/songinfo.dto";
import { Type } from "class-transformer";

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

	@ApiProperty({
		description: "The user's followers",
		type: "object",
		properties: {
			count: { type: "number" },
			data: { type: "array", items: { type: "UserDto" } },
		},
	})
	@IsObject()
	@ValidateNested()
	followers: {
		count: number;
		data: UserDto[];
	};

	@ApiProperty({
		description: "The user's following",
		type: "object",
		properties: {
			count: { type: "number" },
			data: { type: "array", items: { type: "UserDto" } },
		},
	})
	@IsObject()
	@ValidateNested({ each: true })
	following: {
		count: number;
		data: UserDto[];
	};

	@ApiProperty({
		description: "The user's links",
		type: "object",
		properties: {
			count: { type: "number" },
			data: { type: "array", items: { type: "string" } },
		},
	})
	@IsObject()
	@ValidateNested()
	links: {
		count: number;
		data: string[];
	};

	@ApiProperty()
	@IsString()
	bio: string;

	@ApiPropertyOptional({
		description:
			"The current song the user is listening to, or null if no song is playing",
		type: SongInfoDto,
	})
	@IsObject()
	@ValidateNested()
	@Type(() => SongInfoDto)
	current_song?: SongInfoDto;

	@ApiProperty({
		description: "The user's favorite genres",
		type: "object",
		properties: {
			count: { type: "number" },
			data: { type: "array", items: { type: "string" } },
		},
	})
	@IsObject()
	@ValidateNested()
	fav_genres: {
		count: number;
		data: string[];
	};

	@ApiProperty({
		description: "The user's favorite songs",
		type: "object",
		properties: {
			count: { type: "number" },
			data: { type: "array", items: { type: "SongInfoDto" } },
		},
	})
	@IsObject()
	@ValidateNested()
	fav_songs: {
		count: number;
		data: SongInfoDto[];
	};

	@ApiProperty({
		description: "The user's favorite rooms",
		type: "object",
		properties: {
			count: { type: "number" },
			data: { type: "array", items: { type: "RoomDto" } },
		},
	})
	@IsObject()
	@ValidateNested()
	fav_rooms: {
		count: number;
		data: RoomDto[];
	};

	@ApiProperty({
		description: "The user's recent rooms",
		type: "object",
		properties: {
			count: { type: "number" },
			data: { type: "array", items: { type: "RoomDto" } },
		},
	})
	@IsObject()
	@ValidateNested()
	recent_rooms: {
		count: number;
		data: RoomDto[];
	};

	@ApiPropertyOptional({
		description:
			"The user's friendship status with the current user, or null if the user is not friends with the current user",
		type: "object",
		properties: {
			status: { type: "boolean" },
			accept_url: { type: "string" },
			reject_url: { type: "string" },
		},
	})
	@IsObject()
	@ValidateNested()
	friendship?: {
		status: boolean;
		accept_url: string;
		reject_url: string;
	};
}
