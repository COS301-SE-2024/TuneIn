import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsDate } from "class-validator";

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
	@ApiProperty({
		description: "The date the emoji was sent",
	})
	@IsDate()
	date_created: Date;

	@ApiProperty({
		description: "The message body",
	})
	@IsString()
	body: string;

	@ApiProperty({
		description: "The user that used the emoji",
	})
	@IsString()
	userID: string;
}
