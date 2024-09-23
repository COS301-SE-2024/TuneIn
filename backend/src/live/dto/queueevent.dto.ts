import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsObject, ValidateNested, IsDate } from "class-validator";
import { RoomSongDto } from "../../modules/rooms/dto/roomsong.dto";

export class QueueEventDto {
	@ApiProperty()
	@IsObject()
	@ValidateNested()
	songs: RoomSongDto[];

	@ApiProperty()
	@IsString()
	roomID: string;

	@ApiProperty()
	@IsDate()
	createdAt?: Date;
}
