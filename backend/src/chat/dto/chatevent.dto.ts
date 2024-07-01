//ChatEventDto
// a class that defines the structure of the ChatEventDto object
//the object is used to define the structure of the data that is sent & received to the server when a live chat event is triggered (websocket event)
import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsDateString } from "class-validator";
import { LiveChatMessageDto } from "./livechatmessage.dto";

export class ChatEventDto {
	@ApiProperty()
	@IsDateString()
	date_created?: Date;

	@ApiProperty()
	body?: LiveChatMessageDto;

	@ApiProperty()
	@IsString()
	userID: string | null;

	@ApiProperty()
	@IsString()
	errorMessage?: string;
}
