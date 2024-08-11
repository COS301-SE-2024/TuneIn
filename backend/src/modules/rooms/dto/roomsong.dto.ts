import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNumber, IsDate } from "class-validator";

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
	@IsDate()
	startTime?: Date;
}
