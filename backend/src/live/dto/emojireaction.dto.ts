//ChatEventDto
// a class that defines the structure of the ChatEventDto object
//the object is used to define the structure of the data that is sent & received to the server when a live chat event is triggered (websocket event)
import { ApiProperty } from "@nestjs/swagger";
import {
	IsString,
	IsDateString,
	IsObject,
	ValidateNested,
} from "class-validator";

//for Emoji and Category, see: https://github.com/woodybury/rn-emoji-picker
export interface Emoji {
	category: string;
	keywords: string[];
	name: string;
	order: number;
	unified: string;
	emoji: string;
}

export interface Category {
	key: string;
	name: string;
	emoji?: string;
}

export class EmojiReactionDto {
	@ApiProperty()
	@IsDateString()
	date_created: Date;

	@ApiProperty()
	@IsObject()
	@ValidateNested()
	body: Emoji;

	@ApiProperty()
	@IsString()
	userID: string;
}
