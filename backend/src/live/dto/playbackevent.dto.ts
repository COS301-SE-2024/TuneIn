//PlaybackEventDto
// a class that defines the structure of the PlaybackEventDto object
//the object is used to define the structure of the data that is sent & received to the server when a media playback event is triggered (websocket event)
import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsDateString } from "class-validator";

export class PlaybackEventDto {
	@ApiProperty()
	@IsDateString()
	date_created?: Date;

	@ApiProperty()
	@IsString()
	userID: string | null;

	@ApiProperty()
	@IsString()
	roomID: string;

	@ApiProperty()
	@IsString()
	songID: string | null;

	@ApiProperty()
	@IsString()
	UTC_time: number;

	@ApiProperty()
	@IsString()
	errorMessage?: string;
}
