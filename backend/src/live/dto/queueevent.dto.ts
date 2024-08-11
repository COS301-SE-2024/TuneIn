import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsObject, ValidateNested, IsDate } from "class-validator";
import { RoomSongDto } from "src/modules/rooms/dto/roomsong.dto";

export class QueueEventDto {
	@ApiProperty()
	@IsObject()
	@ValidateNested()
	song: RoomSongDto;

	@ApiProperty()
	@IsString()
	roomID: string;

	@ApiProperty()
	@IsDate()
	createdAt?: Date;
}
