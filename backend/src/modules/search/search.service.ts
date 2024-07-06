import { Injectable } from "@nestjs/common";
import { UserDto } from "../users/dto/user.dto";
import { RoomDto } from "../rooms/dto/room.dto";
import { ApiProperty } from "@nestjs/swagger";
import { IsArray, ValidateNested } from "class-validator";

export class CombinedSearchResults {
	@ApiProperty({ type: [RoomDto], description: "List of rooms" })
	@IsArray({ message: "Rooms must be an array" })
	@ValidateNested({ each: true, message: "Each room must be a valid RoomDto" })
	rooms: RoomDto[];

	@ApiProperty({ type: [UserDto], description: "List of users" })
	@IsArray({ message: "Users must be an array" })
	@ValidateNested({ each: true, message: "Each user must be a valid UserDto" })
	users: UserDto[];
}

@Injectable()
export class SearchService {}
