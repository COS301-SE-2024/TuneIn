import { LiveChatMessageDto } from "../../api-client";

export class ChatEventDto {
	date_created?: Date;
	body?: LiveChatMessageDto;
	userID: string | null;
	errorMessage?: string;
}
