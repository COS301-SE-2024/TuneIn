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
		// console.log(params);
		let users;

		const rooms = await this.searchRooms(params);
		if (params.creator) {
			users = await this.searchUsers(params.creator);
		}

		console.log("Rooms: " + rooms);
		console.log("Users: " + users);

		if (users) {
			return {
				rooms: rooms,
				users: users,
			};
		}

		return {
			rooms: rooms,
			users: [],
		};
	}

	async searchRooms(params: {
		q: string;
		creator?: string;
	}): Promise<RoomDto[]> {
		// console.log(params);
		const result = await this.prisma.$queryRaw<PrismaTypes.room>`
		SELECT room_id, name, description, username,
       	LEAST(levenshtein(name, ${params.q}), levenshtein(username, ${params.creator})) AS distance
		FROM room INNER JOIN users ON room_creator = user_id
		WHERE similarity(name, ${params.q}) > 0.2
		OR similarity(username, ${params.creator}) > 0.2
		ORDER BY distance ASC
		LIMIT 10;`;

		// console.log(result);

		if (Array.isArray(result)) {
			const roomIds = result.map((row) => row.room_id.toString());
			const roomDtos = await this.dtogen.generateMultipleRoomDto(roomIds);
			// console.log(roomDtos);

			if (roomDtos) {
				return roomDtos;
			}
		} else {
			console.error("Unexpected query result format, expected an array.");
		}

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

		let query = `
        SELECT room_id, name, description, username,
               LEAST(levenshtein(name, ${params.q}), levenshtein(username, ${params.creator_username || params.creator_name})) AS distance
        FROM room INNER JOIN users ON room_creator = user_id
        WHERE similarity(name, ${params.q}) > 0.2
           OR similarity(username, ${params.creator_username || params.creator_name}) > 0.2`;

		// Handle optional parameters
		if (params.participant_count !== undefined) {
			query += ` AND participant_count = ${params.participant_count}`;
		}
		if (params.description !== undefined) {
			query += ` AND description ILIKE '%${params.description}%'`;
		}
		if (params.is_temp !== undefined) {
			query += ` AND is_temporary = ${params.is_temp}`;
		}
		if (params.is_priv !== undefined) {
			query += ` AND is_private = ${params.is_priv}`;
		}
		if (params.is_scheduled !== undefined) {
			query += ` AND is_scheduled = ${params.is_scheduled}`;
		}
		if (params.start_date !== undefined) {
			query += ` AND start_date >= '${params.start_date}'`;
		}
		if (params.end_date !== undefined) {
			query += ` AND end_date <= '${params.end_date}'`;
		}
		if (params.lang !== undefined) {
			query += ` AND room_language = '${params.lang}'`;
		}
		if (params.explicit !== undefined) {
			query += ` AND explicit = ${params.explicit}`;
		}
		if (params.nsfw !== undefined) {
			query += ` AND nsfw = ${params.nsfw}`;
		}
		if (params.tags && params.tags.length > 0) {
			const tagsCondition = params.tags
				.map((tag) => `tags @> ARRAY['${tag}']`)
				.join(" OR ");
			query += ` AND (${tagsCondition})`;
		}

		query += ` ORDER BY distance ASC LIMIT 10`;

		// Execute the query using Prisma or your preferred ORM
		const rooms = await this.prisma.$queryRaw<RoomDto[]>(query);

		return [new RoomDto()];
	}

	async searchRoomsHistory(userID: string): Promise<RoomDto[]> {
		console.log(userID);
		return [new RoomDto()];
	}

	async searchUsers(q: string): Promise<UserDto[]> {
		// console.log(q);

		const result = await this.prisma.$queryRaw<PrismaTypes.users>`
		SELECT *,
		LEVENSHTEIN(username, ${q}) AS distance
		FROM users
		WHERE similarity(username, ${q}) > 0.2
		ORDER BY distance ASC
		LIMIT 5;`;

		// console.log(result);

		if (Array.isArray(result)) {
			const userIds = result.map((row) => row.user_id.toString());
			const userDtos = await this.dtogen.generateMultipleUserDto(userIds);
			// console.log(userDtos);

			if (userDtos) {
				return userDtos;
			}
		} else {
			console.error("Unexpected query result format, expected an array.");
		}

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
