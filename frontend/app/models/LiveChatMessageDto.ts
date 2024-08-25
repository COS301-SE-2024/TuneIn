import { UserDto } from "./UserDto";

//LiveChatMessageDto
export type LiveChatMessageDto = {
	messageBody: string;
	sender: UserDto;
	roomID: string;
	dateCreated?: Date;
};
