import { ApiProperty } from "@nestjs/swagger";
import { UserDto } from "src/modules/users/dto/user.dto";
import { SongInfoDto } from "../dto/songinfo.dto";

export class RoomEntity {
	@ApiProperty({ type: UserDto })
	creator: UserDto;

	@ApiProperty()
	roomID: string;

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

	@ApiProperty({ type: Date })
	start_date: Date;

	@ApiProperty({ type: Date })
	end_date: Date;

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
