import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsBoolean, IsDateString, IsOptional } from "class-validator";

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
	@IsDateString()
	@IsOptional()
	start_date?: Date;

	@ApiPropertyOptional()
	@IsDateString()
	@IsOptional()
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

	@ApiProperty({ type: [String] })
	tags: string[];
}
