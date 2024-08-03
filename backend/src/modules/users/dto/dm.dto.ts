import { ApiProperty } from "@nestjs/swagger";
import {
	IsString,
	IsDateString,
	IsNumber,
	IsObject,
	IsBoolean,
} from "class-validator";
import { UserDto } from "../../users/dto/user.dto";

export class DirectMessageDto {
	@ApiProperty()
	@IsNumber()
	index: number;

	@ApiProperty()
	@IsString()
	messageBody: string;

	@ApiProperty()
	@IsObject()
	sender: UserDto;

	@ApiProperty()
	@IsObject()
	recipient: UserDto;

	@ApiProperty()
	@IsString()
	roomID: string;

	@ApiProperty()
	@IsDateString()
	dateSent: Date;

	@ApiProperty()
	@IsDateString()
	dateRead: Date;

	@ApiProperty()
	@IsBoolean()
	isRead: boolean;
}
