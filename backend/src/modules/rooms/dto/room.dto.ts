import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
	IsString,
	IsBoolean,
	IsNumber,
	IsObject,
	IsDate,
	ValidateNested,
} from "class-validator";
import { UserDto } from "../../users/dto/user.dto";
import { Type } from "class-transformer";
import { RoomSongDto } from "./roomsong.dto";

export class RoomDto {
	@ApiProperty({
		type: UserDto,
	})
	@IsObject()
	@ValidateNested()
	@Type(() => UserDto)
	creator: UserDto;

	@ApiProperty()
	@IsString()
	roomID: string;

	@ApiProperty()
	@IsString()
	spotifyPlaylistID: string;

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
	start_date?: Date | undefined;

	@ApiPropertyOptional()
	@IsDate()
	end_date?: Date | undefined;

	@ApiProperty()
	@IsDate()
	date_created: Date;

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
		type: RoomSongDto,
	})
	@IsObject()
	@ValidateNested()
	@Type(() => RoomSongDto)
	current_song?: RoomSongDto;

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
	parentRoomID?: string | undefined;

	@ApiProperty({
		description: "Rooms created by splitting this room.",
		type: String,
		isArray: true,
	})
	childrenRoomIDs: string[];
}
