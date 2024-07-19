import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsDateString, IsObject, ValidateNested } from "class-validator";
import { UserDto } from "../../users/dto/user.dto";
import { RoomDto } from "../../rooms/dto/room.dto";

export class SearchHistoryDto {
    @ApiProperty()
	@IsString()
	search_term: string;

    @ApiProperty()
	@IsDateString()
	search_time: Date;

    @ApiProperty()
	@IsString()
	url: string;
}