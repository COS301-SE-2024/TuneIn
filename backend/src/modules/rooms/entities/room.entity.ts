import { ApiProperty } from "@nestjs/swagger";
import { UserProfileDto } from "../../profile/dto/userprofile.dto";
import { DateTime } from "luxon";
import { SongInfoDto } from "./songinfo.dto";

export class RoomDto {
	@ApiProperty({ type: UserProfileDto })
	creator: UserProfileDto;

	@ApiProperty()
	room_id: string;

	@ApiProperty()
	participant_count: number;

	@ApiProperty()
	room_name: string;

	@ApiProperty()
	description: string;

	@ApiProperty()
	is_temporary: boolean;

	@ApiProperty()
	is_private: boolean;

	@ApiProperty()
	is_scheduled: boolean;

	@ApiProperty({ type: DateTime })
	start_date: DateTime;

	@ApiProperty({ type: DateTime })
	end_date: DateTime;

	@ApiProperty()
	language: string;

	@ApiProperty()
	has_explicit_content: boolean;

	@ApiProperty()
	has_nsfw_content: boolean;

	@ApiProperty()
	room_image: string;

	@ApiProperty({ type: SongInfoDto })
	current_song: SongInfoDto;

	@ApiProperty({ type: [String] })
	tags: string[];
}
