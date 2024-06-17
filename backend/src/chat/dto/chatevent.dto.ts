//ChatEventDto
// a class that defines the structure of the ChatEventDto object
//the object is used to define the structure of the data that is sent & received to the server when a live chat event is triggered (websocket event)
import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsDateString } from "class-validator";
import { UserProfileDto } from "src/modules/profile/dto/userprofile.dto";
import { LiveChatMessageDto } from "./livechatmessage.dto";

export class ChatEventDto {
	@ApiProperty()
	@IsString()
	event: string;

	@ApiProperty()
	sender: UserProfileDto | string | null;

	@ApiProperty()
	@IsDateString()
	date_created?: Date;

	@ApiProperty()
	body?: LiveChatMessageDto;

	@ApiProperty()
	@IsString()
	errorMessage?: string;
}
