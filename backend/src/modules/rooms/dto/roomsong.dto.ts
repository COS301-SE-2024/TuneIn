import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsNumber } from "class-validator";

export class RoomSongDto {
	@ApiProperty()
	@IsString()
	spotifyID: string;

	@ApiProperty()
	@IsString()
	userID: string;

	@ApiProperty()
	@IsNumber()
	score: number;

	@ApiProperty()
	@IsNumber()
	index: number;

	@ApiPropertyOptional()
	@IsNumber()
	startTime?: number;

	@ApiProperty()
	@IsNumber()
	insertTime: number;

	@ApiPropertyOptional()
	@IsNumber()
	pauseTime?: number;

	@ApiProperty()
	@IsNumber()
	playlistIndex: number;
}
