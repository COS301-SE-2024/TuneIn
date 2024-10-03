import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsBoolean, IsOptional, IsDate } from "class-validator";
import { Transform } from "class-transformer";

export class CreateRoomDto {
	@ApiProperty()
	@IsString()
	room_name: string;

	@ApiProperty()
	@IsString()
	description: string;

	@ApiPropertyOptional()
	@IsBoolean()
	@IsOptional()
	is_temporary?: boolean;

	@ApiPropertyOptional()
	@IsBoolean()
	@IsOptional()
	is_private?: boolean;

	@ApiPropertyOptional()
	@IsBoolean()
	@IsOptional()
	is_scheduled?: boolean;

	@ApiPropertyOptional()
	@IsDate()
	@IsOptional()
	@Transform(({ value }) => new Date(value))
	start_date?: Date;

	@ApiPropertyOptional()
	@IsDate()
	@IsOptional()
	@Transform(({ value }) => new Date(value))
	end_date?: Date;

	@ApiPropertyOptional()
	@IsString()
	@IsOptional()
	language?: string;

	@ApiPropertyOptional()
	@IsBoolean()
	@IsOptional()
	has_explicit_content?: boolean;

	@ApiPropertyOptional()
	@IsBoolean()
	@IsOptional()
	has_nsfw_content?: boolean;

	@ApiPropertyOptional()
	@IsString()
	@IsOptional()
	room_image?: string;

	@ApiProperty({
		description: "The tags that describe the room",
		type: String,
		isArray: true,
	})
	tags: string[];
}
