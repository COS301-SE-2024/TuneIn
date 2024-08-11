import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsBoolean, IsDate } from "class-validator";

export class VoteDto {
	@ApiProperty()
	@IsBoolean()
	isUpvote: boolean;

	@ApiProperty()
	@IsString()
	userID: string;

	@ApiProperty()
	@IsString()
	spotifyID: string;

	@ApiProperty()
	@IsDate()
	createdAt: Date;
}
