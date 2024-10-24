import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsDate } from "class-validator";

export class SearchHistoryDto {
	@ApiProperty()
	@IsString()
	search_term: string;

	@ApiProperty()
	@IsDate()
	search_time: Date;

	@ApiProperty()
	@IsString()
	url: string;
}
