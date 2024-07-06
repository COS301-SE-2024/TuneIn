import { Injectable } from "@nestjs/common";
import { UserDto } from "../users/dto/user.dto";
import { RoomDto } from "../rooms/dto/room.dto";
import { ApiProperty } from "@nestjs/swagger";
import { IsArray, ValidateNested } from "class-validator";
import { PrismaService } from "../../../prisma/prisma.service";
import { DbUtilsService } from "../db-utils/db-utils.service";
import { DtoGenService } from "../dto-gen/dto-gen.service";

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
export class SearchService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly dbUtils: DbUtilsService,
		private readonly dtogen: DtoGenService,
	) {}

	async combinedSearch(params: {
		q: string;
		creator?: string;
	}): Promise<CombinedSearchResults> {
		return new CombinedSearchResults();
	}

	async searchRooms(params: {
		q: string;
		creator?: string;
	}): Promise<RoomDto[]> {
		return [new RoomDto()];
	}

	async advancedSearchRooms(params: {
		q: string;
		creator_username?: string;
		creator_name?: string;
		participant_count?: number;
		description?: string;
		is_temp?: boolean;
		is_priv?: boolean;
		is_scheduled?: boolean;
		start_date?: string;
		end_date?: string;
		lang?: string;
		explicit?: boolean;
		nsfw?: boolean;
		tags?: string[];
	}): Promise<RoomDto[]> {
		return [new RoomDto()];
	}

	async searchRoomsHistory(userID: string): Promise<RoomDto[]> {
		return [new RoomDto()];
	}

	async searchUsers(q: string): Promise<UserDto[]> {
		return [new UserDto()];
	}

	async advancedSearchUsers(params: {
		q: string;
		creator_username?: string;
		creator_name?: string;
		following?: number;
		followers?: number;
	}): Promise<UserDto[]> {
		return [new UserDto()];
	}

	async searchUsersHistory(userID: string): Promise<UserDto[]> {
		return [new UserDto()];
	}
}
