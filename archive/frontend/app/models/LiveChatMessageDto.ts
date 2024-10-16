import { UserDto } from "../../api";

//LiveChatMessageDto
export type LiveChatMessageDto = {
	messageBody: string;
	sender: UserDto;
	roomID: string;
	dateCreated?: Date;
};
