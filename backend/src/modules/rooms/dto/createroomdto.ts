import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsBoolean, IsDateString, IsOptional } from "class-validator";

export class CreateRoomDto {
	@ApiProperty()
	@IsString()
	room_name: string;

	@ApiProperty()
	@IsString()
	description: string;

	@ApiProperty()
	@IsBoolean()
	@IsOptional()
	is_temporary?: boolean;

	@ApiProperty()
	@IsBoolean()
	@IsOptional()
	is_private?: boolean;

	@ApiProperty()
	@IsBoolean()
	@IsOptional()
	is_scheduled?: boolean;

	@ApiProperty()
	@IsDateString()
	@IsOptional()
	start_date?: Date;

	@ApiProperty()
	@IsDateString()
	@IsOptional()
	end_date?: Date;

	@ApiProperty()
	@IsString()
	@IsOptional()
	language?: string;

	@ApiProperty()
	@IsBoolean()
	@IsOptional()
	has_explicit_content?: boolean;

	@ApiProperty()
	@IsBoolean()
	@IsOptional()
	has_nsfw_content?: boolean;

	@ApiProperty()
	@IsString()
	@IsOptional()
	room_image?: string;

	@ApiProperty({ type: [String] })
	tags: string[];
}
