import { ApiProperty } from "@nestjs/swagger";
import { Track } from "@spotify/web-api-ts-sdk";
import { IsString, IsNumber, IsDate, IsObject } from "class-validator";

export class RoomSongDto {
	@ApiProperty()
	@IsString()
	spotifyID: string;

	@ApiProperty()
	@IsString()
	userID: string;

	@ApiProperty()
	@IsNumber()
	score?: number;

	@ApiProperty()
	@IsNumber()
	index: number;

	@ApiProperty()
	@IsDate()
	startTime?: Date;

	@ApiProperty()
	@IsDate()
	pauseTime?: Date;

	@ApiProperty()
	@IsObject()
	track?: Track;
}
