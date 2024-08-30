import { ApiProperty } from "@nestjs/swagger";

export class SongInfoEntity {
	@ApiProperty()
	title: string;

	@ApiProperty({ type: [String] })
	artists: string[];

	@ApiProperty()
	cover: string;

	@ApiProperty({ type: Date })
	start_time: Date;
}
