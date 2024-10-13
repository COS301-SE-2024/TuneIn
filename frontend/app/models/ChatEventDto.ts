import { LiveChatMessageDto } from "./LiveChatMessageDto";

export type ChatEventDto = {
	date_created?: Date;
	body?: LiveChatMessageDto;
	userID: string | null;
	errorMessage?: string;
};
