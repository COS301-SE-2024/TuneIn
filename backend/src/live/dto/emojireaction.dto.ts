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
	@IsString()
	body: string;

	@ApiProperty()
	@IsString()
	userID: string;
}
