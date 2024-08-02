import { LiveChatMessageDto } from "../../api-client";

export type ChatEventDto = {
	date_created?: Date;
	body?: LiveChatMessageDto;
	userID: string | null;
	errorMessage?: string;
};
