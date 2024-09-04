//PlaybackEventDto
// a class that defines the structure of the PlaybackEventDto object
//the object is used to define the structure of the data that is sent & received to the server when a media playback event is triggered (websocket event)
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsObject, IsDate } from "class-validator";
import { RoomSongDto } from "src/modules/rooms/dto/roomsong.dto";

export class PlaybackEventDto {
	@ApiPropertyOptional()
	@IsDate()
	date_created?: Date;

	@ApiProperty({
		description:
			"The userID that triggered the event, or null if emitted by the server",
		type: String,
		nullable: true,
	})
	@IsString()
	userID: string | null;

	@ApiProperty()
	@IsString()
	roomID: string;

	@ApiProperty({
		description: "The songID that was played, or null if no song was played",
		type: String,
		nullable: true,
	})
	@IsString()
	spotifyID: string | null;

	@ApiProperty()
	@IsObject()
	song?: RoomSongDto | null;

	@ApiProperty({
		description:
			"The UTC time the event was triggered, or null if no time was recorded",
		type: Number,
		nullable: true,
	})
	@IsString()
	UTC_time: number | null;

	@ApiPropertyOptional()
	@IsString()
	errorMessage?: string;
}
