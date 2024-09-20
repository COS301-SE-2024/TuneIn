//LiveChatMessageDto
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
	IsString,
	IsDateString,
	ValidateNested,
	IsObject,
	IsDate,
} from "class-validator";
import { UserDto } from "../../modules/users/dto/user.dto";
import { Type } from "class-transformer";

export class LiveChatMessageDto {
	@ApiProperty()
	@IsString()
	messageID: string;

	@ApiProperty()
	@IsString()
	messageBody: string;

	@ApiProperty()
	@IsObject()
	@ValidateNested()
	@Type(() => UserDto)
	sender: UserDto;

	@ApiProperty()
	@IsString()
	roomID: string;

	@ApiPropertyOptional()
	@IsDate()
	dateCreated?: Date;
}
