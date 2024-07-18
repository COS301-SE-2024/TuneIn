import { Injectable } from "@nestjs/common";
import { UserDto } from "../users/dto/user.dto";
import { RoomDto } from "../rooms/dto/room.dto";
import { ApiProperty } from "@nestjs/swagger";
import { IsArray, ValidateNested } from "class-validator";
import { PrismaService } from "../../../prisma/prisma.service";
//import { Prisma } from "@prisma/client";
import * as PrismaTypes from "@prisma/client";
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

	// Fuzzy search tutorial
	/*
	using pg_trgm to fuzzy search with threshold 0.4
	```
	SELECT
	*
	FROM artists
	WHERE SIMILARITY(name,'Claud Monay') > 0.4 ;
	```

	using pg_trgm to fuzzy search to search part of a string (with default threshold 0.3)
	```
	SELECT
	*
	FROM artists
	WHERE 'Cadinsky' % ANY(STRING_TO_ARRAY(name,' '));
	```

	using Levenstein distances (for closest matching words)
	```
	SELECT
		*,
		LEVENSHTEIN(name, 'Freda Kallo')
	FROM artists
	ORDER BY LEVENSHTEIN(name, 'Freda Kallo') ASC
	LIMIT 5
	```
	*/
	async demoSearch() {
		const result = await this.prisma.$queryRaw<PrismaTypes.room>`
		SELECT * FROM room WHERE SIMILARITY(name,'Conbrete') > 0.4;`;
		console.log(result);
	}

	async combinedSearch(params: {
		q: string;
		creator?: string;
	}): Promise<CombinedSearchResults> {
		console.log(params);
		return new CombinedSearchResults();
	}

	async searchRooms(params: {
		q: string;
		creator?: string;
	}): Promise<RoomDto[]> {
		console.log(params);
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
		console.log(params);
		return [new RoomDto()];
	}

	async searchRoomsHistory(userID: string): Promise<RoomDto[]> {
		console.log(userID);
		return [new RoomDto()];
	}

	async searchUsers(q: string): Promise<UserDto[]> {
		console.log(q);
		return [new UserDto()];
	}

	async advancedSearchUsers(params: {
		q: string;
		creator_username?: string;
		creator_name?: string;
		following?: number;
		followers?: number;
	}): Promise<UserDto[]> {
		console.log(params);
		return [new UserDto()];
	}

	async searchUsersHistory(userID: string): Promise<UserDto[]> {
		console.log(userID);
		return [new UserDto()];
	}
}
