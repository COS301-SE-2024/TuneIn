//LiveChatMessageDto
import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsDateString } from "class-validator";
import { UserProfileDto } from "src/modules/profile/dto/userprofile.dto";

export class LiveChatMessageDto {
	@ApiProperty()
	@IsString()
	body: string;

	@ApiProperty()
	sender: UserProfileDto;

	@ApiProperty()
	@IsString()
	roomID: string;

	@ApiProperty()
	@IsDateString()
	date_created?: Date;
}
