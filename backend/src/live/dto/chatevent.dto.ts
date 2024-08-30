//ChatEventDto
// a class that defines the structure of the ChatEventDto object
//the object is used to define the structure of the data that is sent & received to the server when a live chat event is triggered (websocket event)
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsDateString, IsObject, IsDate, ValidateNested } from "class-validator";
import { LiveChatMessageDto } from "./livechatmessage.dto";
import { Type } from "class-transformer";

export class ChatEventDto {
	@ApiPropertyOptional({
		description: "The date the event was created",
	})
	@IsDate()
	date_created?: Date;

	@ApiPropertyOptional({
		description: "The message body",
		type: LiveChatMessageDto,
	})
	@IsObject()
	@Type(() => LiveChatMessageDto)
	@ValidateNested()
	body?: LiveChatMessageDto;

	@ApiProperty({
		description: "The userID †hat triggered the event, or null if emitted by the server",
		type: String,
		nullable: true,
	})
	@IsString()
	userID: string | null;

	@ApiPropertyOptional({
		description: "An error message, if applicable",
	})
	@IsString()
	errorMessage?: string;
}
