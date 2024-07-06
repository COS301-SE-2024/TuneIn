//LiveChatMessageDto
import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsDateString } from "class-validator";
import { UserDto } from "src/modules/users/dto/user.dto";

export class LiveChatMessageDto {
	@ApiProperty()
	@IsString()
	messageBody: string;

	@ApiProperty()
	sender: UserDto;

	@ApiProperty()
	@IsString()
	roomID: string;

	@ApiProperty()
	@IsDateString()
	dateCreated?: Date;
}
