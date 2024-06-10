import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsArray, IsDate } from "class-validator";

export class SongInfoDto {
	@ApiProperty()
	@IsString()
	title: string;

	@ApiProperty({ type: [String] })
	@IsArray()
	artists: string[];

	@ApiProperty()
	@IsString()
	cover: string;

	@ApiProperty()
	@IsDate()
	start_time: Date;
}
