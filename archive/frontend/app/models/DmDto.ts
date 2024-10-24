import { UserDto } from "../../api";

export type DirectMessageDto = {
	index: number;
	messageBody: string;
	sender: UserDto;
	recipient: UserDto;
	dateSent: Date;
	dateRead: Date;
	isRead: boolean;
	pID: string;
	bodyIsRoomID: boolean;
};
