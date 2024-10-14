import { ApiProperty } from "@nestjs/swagger";
import {
	IsString,
	IsNumber,
	IsObject,
	IsBoolean,
	ValidateNested,
	IsDate,
} from "class-validator";
import { UserDto } from "../../users/dto/user.dto";
import { Type } from "class-transformer";

export class DirectMessageDto {
	@ApiProperty()
	@IsNumber()
	index: number;

	@ApiProperty()
	@IsString()
	messageBody: string;

	@ApiProperty({
		description: "The sender of the message",
		type: UserDto,
	})
	@IsObject()
	@ValidateNested()
	@Type(() => UserDto)
	sender: UserDto;

	@ApiProperty({
		description: "The recipient of the message",
		type: UserDto,
	})
	@IsObject()
	@ValidateNested()
	@Type(() => UserDto)
	recipient: UserDto;

	@ApiProperty()
	@IsDate()
	dateSent: Date;

	@ApiProperty()
	@IsDate()
	dateRead: Date;

	@ApiProperty()
	@IsBoolean()
	isRead: boolean;

	@ApiProperty()
	@IsString()
	pID: string;

	@ApiProperty()
	@IsBoolean()
	bodyIsRoomID: boolean;
}
