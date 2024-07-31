import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsDateString } from "class-validator";

export class SearchHistoryDto {
	@ApiProperty()
	@IsString()
	search_term: string;

	@ApiProperty()
	@IsDateString()
	search_time: Date;

	@ApiProperty()
	@IsString()
	url: string;
}
