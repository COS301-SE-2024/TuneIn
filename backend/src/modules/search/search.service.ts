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

	parseBoolean(value: any): boolean {
		if (typeof value === 'string') {
			// Convert string to lower case to handle variations in casing
			value = value.toLowerCase();
			if (value === 'true' || value === '1') {
				return true;
			} else if (value === 'false' || value === '0') {
				return false;
			}
		}
		// Default to false if value is not recognized as a boolean string
		return false;
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
		tags?: string;
	}): Promise<RoomDto[]> {
		console.log(params);

		let query = `
        SELECT room.*,`;

		if(params.creator_name === undefined && params.creator_username === undefined) {
			query += ` levenshtein(name, '${params.q}') AS distance`;
		}		
		else if(params.creator_name !== undefined && params.creator_username !== undefined) {
			query += ` LEAST(levenshtein(name, '${params.q}'), levenshtein(username, '${params.creator_username}'), levenshtein(full_name, '${params.creator_name}')) AS distance`;
		}
		else if(params.creator_name !== undefined) {
			query += ` LEAST(levenshtein(name, '${params.q}'), levenshtein(full_name, '${params.creator_name}')) AS distance`;
		}
		else if(params.creator_username !== undefined) {
			query += ` LEAST(levenshtein(name, '${params.q}'), levenshtein(username, '${params.creator_username}')) AS distance`;
		}
		
		if(params.description !== undefined){
			query += `, levenshtein(description, 'Get energized') AS desc_distance`;
		}

		query += ` FROM room INNER JOIN users ON room_creator = user_id`;

		// console.log("priv: " + params.is_priv);

		if (params.is_scheduled !== undefined) {
			query += ` LEFT JOIN scheduled_room on room.room_id = scheduled_room.room_id`;
		}
		if (params.is_priv !== undefined) {
			query += ` LEFT JOIN private_room on room.room_id = private_room.room_id`;
		}
		if (params.participant_count !== undefined) {
			query += ` INNER JOIN participate ON room.room_id = participate.room_id`;
		}

        query += ` WHERE (similarity(name, '${params.q}') > 0.2`;

		if(params.creator_name !== undefined && params.creator_username !== undefined) {
			query += ` OR similarity(username, '${params.creator_username}') > 0.2 OR similarity(full_name, '${params.creator_name}') > 0.2`;
		}
		else if(params.creator_name !== undefined) {
			query += ` OR similarity(full_name, '${params.creator_name}') > 0.2`;		}
		else if(params.creator_username !== undefined) {
			query += ` OR similarity(username, '${params.creator_username}') > 0.2`;
		}
		query += ` )`;

		// Handle optional parameters
		
		if (params.description !== undefined) {
			query += ` AND levenshtein(description, '${params.description}') < 100`;
		}
		if (params.is_temp !== undefined) {
			query += ` AND is_temporary = ${params.is_temp}`;
		}
		if (params.is_scheduled !== undefined) {
			if(this.parseBoolean(params.is_scheduled)){
				query += ` AND scheduled_date IS NOT NULL`;
			}
			else{
				query += ` AND scheduled_date IS NULL`;
			}
		}
		if (params.is_priv !== undefined) {
			if(this.parseBoolean(params.is_priv)){
				query += ` AND is_listed IS NOT NULL`;
			}
			else{
				query += ` AND is_listed IS NULL`;
			}
		}
		
		if (params.is_scheduled !== undefined && params.start_date !== undefined) {
			query += ` AND scheduled_date AT TIME ZONE 'UTC' = '${params.start_date}'`;
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
			const tags = params.tags.split(',');
			const tagsCondition = tags
				.map((tag) => `tags @> ARRAY['${tag}']`)
				.join(" OR ");
			query += ` AND (${tagsCondition})`;
		}
		if (params.participant_count !== undefined) {
			query += ` GROUP BY room.room_id
			HAVING COUNT(participate.room_id) >= ${params.participant_count}`;
		}

		query += ` ORDER BY distance ASC LIMIT 10`;
		console.log(query);

		const result = await this.prisma.$queryRawUnsafe<PrismaTypes.room>(query);

		if (Array.isArray(result)) {
			const roomIds = result.map((row) => row.room_id.toString());
			const roomDtos = await this.dtogen.generateMultipleRoomDto(roomIds);
			console.log(roomDtos);

			if (roomDtos) {
				return roomDtos;
			}
		} else {
			console.error("Unexpected query result format, expected an array.");
		}

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
