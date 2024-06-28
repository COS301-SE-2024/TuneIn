//LiveChatMessageDto
import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsDateString } from "class-validator";
import { UserProfileDto } from "../../modules/profile/dto/userprofile.dto";

export class LiveChatMessageDto {
	@ApiProperty()
	@IsString()
	messageBody: string;

	@ApiProperty()
	sender: UserProfileDto;

	@ApiProperty()
	@IsString()
	roomID: string;

	@ApiProperty()
	@IsDateString()
	dateCreated?: Date;
}
