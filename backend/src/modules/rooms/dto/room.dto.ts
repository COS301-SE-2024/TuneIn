import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
	IsString,
	IsBoolean,
	IsNumber,
	IsDateString,
	IsObject,
	IsDate,
	ValidateNested,
} from "class-validator";
import { UserDto } from "../../users/dto/user.dto";
import { SongInfoDto } from "./songinfo.dto";
import { Type } from "class-transformer";

export class RoomCreator {
	@ApiProperty()
	@IsString()
	userID: string;

	@ApiProperty()
	@IsString()
	username: string;

	@ApiProperty()
	@IsString()
	profile_picture_url: string;
}

export class RoomDto {
	@ApiProperty({
		description: "The creator of the room with basic information",
		type: RoomCreator,
	})
	@IsObject()
	@ValidateNested()
	@Type(() => RoomCreator)
	creator: RoomCreator;

	@ApiProperty()
	@IsString()
	roomID: string;

	@ApiProperty()
	@IsNumber()
	participant_count: number;

	@ApiProperty()
	@IsString()
	room_name: string;

	@ApiProperty()
	@IsString()
	description: string;

	@ApiProperty()
	@IsBoolean()
	is_temporary: boolean;

	@ApiProperty()
	@IsBoolean()
	is_private: boolean;

	@ApiProperty()
	@IsBoolean()
	is_scheduled: boolean;

	@ApiPropertyOptional()
	@IsDate()
	start_date?: Date;

	@ApiPropertyOptional()
	@IsDate()
	end_date?: Date;

	@ApiProperty()
	@IsString()
	language: string;

	@ApiProperty()
	@IsBoolean()
	has_explicit_content: boolean;

	@ApiProperty()
	@IsBoolean()
	has_nsfw_content: boolean;

	@ApiProperty()
	@IsString()
	room_image: string;

	@ApiPropertyOptional({
		description: "The current song playing in the room",
		type: SongInfoDto,
	})
	@IsObject()
	@ValidateNested()
	@Type(() => SongInfoDto)
	current_song?: SongInfoDto;

	@ApiProperty({
		description: "The tags that describe the room",
		type: String,
		isArray: true,
	})
	tags: string[];

	@ApiPropertyOptional({
		description:
			"The parent of this room, if this room was created by splitting another",
		type: String,
	})
	parentRoomID?: string;

	@ApiProperty({
		description: "Rooms created by splitting this room.",
		type: String,
		isArray: true,
	})
	childrenRoomIDs: string[];
}
