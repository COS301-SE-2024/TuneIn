import { LiveChatMessageDto } from "../../api";

export type ChatEventDto = {
	date_created?: Date;
	body?: LiveChatMessageDto;
	userID: string | null;
	errorMessage?: string;
};
