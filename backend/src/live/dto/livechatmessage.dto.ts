//LiveChatMessageDto
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsDateString } from "class-validator";
import { UserDto } from "../../modules/users/dto/user.dto";

export class LiveChatMessageDto {
	@ApiProperty()
	@IsString()
	messageBody: string;

	@ApiProperty()
	sender: UserDto;

	@ApiProperty()
	@IsString()
	roomID: string;

	@ApiPropertyOptional()
	@IsDateString()
	dateCreated?: Date;
}
