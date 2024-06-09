import { ApiProperty } from "@nestjs/swagger";
import { DateTime } from "luxon";

export class SongInfoDto {
	@ApiProperty()
	title: string;

	@ApiProperty({ type: [String] })
	artists: string[];

	@ApiProperty()
	cover: string;

	@ApiProperty({ type: DateTime })
	start_time: DateTime;
}
