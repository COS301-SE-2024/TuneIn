import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsBoolean, IsNumber, IsDateString } from "class-validator";

export class RoomDto {
	@ApiProperty({ type: ProfileDto })
	creator: ProfileDto;

	@ApiProperty()
	@IsString()
	room_id: string;

	@ApiProperty()
	@IsNumber()
	partipicant_count: number;

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

	@ApiProperty()
	@IsDateString()
	start_date: Date;

	@ApiProperty()
	@IsDateString()
	end_date: Date;

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

	@ApiProperty({ type: SongInfoDto })
	current_song: SongInfoDto;

	@ApiProperty({ type: [String] })
	tags: string[];
}
