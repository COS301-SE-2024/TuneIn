import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { RoomDto } from "./dto/room.dto";
import { UpdateRoomDto } from "./dto/updateroomdto";
import { SongInfoDto } from "./dto/songinfo.dto";
import { UserProfileDto } from "../profile/dto/userprofile.dto";
import { PrismaService } from "../../../prisma/prisma.service";
import * as PrismaTypes from "@prisma/client";
import { Prisma } from "@prisma/client";
import { DtoGenService } from "../dto-gen/dto-gen.service";
import { DbUtilsService } from "../db-utils/db-utils.service";

@Injectable()
export class RoomsService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly dtogen: DtoGenService,
		private readonly dbUtils: DbUtilsService,
	) {}

	async getNewRooms(limit: number = -1): Promise<RoomDto[]> {
		const r: PrismaTypes.room[] | null = await this.prisma.room.findMany({
			orderBy: {
				date_created: "desc",
			},
		});
		if (!r || r === null) {
			return [];
		}
		const allRooms: PrismaTypes.room[] = r;

		const pr: PrismaTypes.public_room[] | null =
			await this.prisma.public_room.findMany();
		if (!pr || pr === null) {
			return [];
		}
		const publicRooms: PrismaTypes.public_room[] = pr;

		const rooms: PrismaTypes.room[] = [];
		for (const room of allRooms) {
			if (publicRooms.find((pr) => pr.room_id === room.room_id)) {
				rooms.push(room);
			}
		}

		if (limit > 0) {
			publicRooms.splice(limit);
		}

		const result: RoomDto[] = [];
		for (const room of rooms) {
			const roomDto = await this.dtogen.generateRoomDtoFromRoom(room);
			if (roomDto) {
				result.push(roomDto);
			}
		}
		return result;
	}

	getRoomInfo(roomID: string): RoomDto {
		// TODO: Implement logic to get room info
		// an an example to generate a RoomDto
		/*
		const roomID = "xxxx"
		const room = await this.dtogen.generateRoomDto(roomID);
		if (room) {
			return room;
		}
		*/
		return new RoomDto();
	}

	updateRoomInfo(roomID: string, updateRoomDto: UpdateRoomDto): RoomDto {
		// TODO: Implement logic to update room info
		return new RoomDto();
	}

	updateRoom(roomID: string, updateRoomDto: UpdateRoomDto): RoomDto {
		// TODO: Implement logic to update room
		return new RoomDto();
	}

	deleteRoom(roomID: string): boolean {
		// TODO: Implement logic to delete room
		return false;
	}

	joinRoom(roomID: string): boolean {
		// TODO: Implement logic to join room
		return false;
	}

	leaveRoom(roomID: string): boolean {
		// TODO: Implement logic to leave room
		return false;
	}

	getRoomUsers(roomID: string): UserProfileDto[] {
		// TODO: Implement logic to get room users
		return [];
	}

	getRoomQueue(roomID: string): SongInfoDto[] {
		// TODO: Implement logic to get room queue
		return [];
	}

	clearRoomQueue(roomID: string): boolean {
		// TODO: Implement logic to clear room queue
		return false;
	}

	addSongToQueue(roomID: string, songInfoDto: SongInfoDto): SongInfoDto[] {
		// TODO: Implement logic to add song to queue
		return [];
	}

	getCurrentSong(roomID: string): SongInfoDto {
		// TODO: Implement logic to get current playing song
		return new SongInfoDto();
	}

	async bookmarkRoom(roomID: string, userID: string): Promise<void> {
		if (!(await this.dbUtils.userExists(userID))) {
			throw new HttpException("User does not exist", HttpStatus.NOT_FOUND);
		}

		if (!(await this.dbUtils.roomExists(roomID))) {
			throw new HttpException("Room does not exist", HttpStatus.NOT_FOUND);
		}

		const existingBookmark: PrismaTypes.bookmark | null =
			await this.prisma.bookmark.findFirst({
				where: {
					room_id: roomID,
					user_id: userID,
				},
			});

		if (existingBookmark) {
			throw new HttpException(
				"User has already bookmarked this room",
				HttpStatus.CONFLICT,
			);
		}

		const b: Prisma.bookmarkCreateInput = {
			users: {
				connect: {
					user_id: userID,
				},
			},
			room: {
				connect: {
					room_id: roomID,
				},
			},
		};
		const newBookmark: PrismaTypes.bookmark | null =
			await this.prisma.bookmark.create({
				data: b,
			});
		if (!newBookmark || newBookmark === null) {
			throw new Error(
				"Failed to bookmark room. Database returned null after insert.",
			);
		}
	}

	async unbookmarkRoom(roomID: string, userID: string): Promise<void> {
		if (!(await this.dbUtils.userExists(userID))) {
			throw new HttpException("User does not exist", HttpStatus.NOT_FOUND);
		}

		if (!(await this.dbUtils.roomExists(roomID))) {
			throw new HttpException("Room does not exist", HttpStatus.NOT_FOUND);
		}

		const existingBookmark: PrismaTypes.bookmark | null =
			await this.prisma.bookmark.findFirst({
				where: {
					room_id: roomID,
					user_id: userID,
				},
			});
		if (!existingBookmark) {
			throw new HttpException(
				"User has not bookmarked this room",
				HttpStatus.NOT_FOUND,
			);
		}

		const b: Prisma.bookmarkDeleteManyArgs = {
			where: {
				room_id: roomID,
				user_id: userID,
			},
		};
		const delBookmark: Prisma.BatchPayload =
			await this.prisma.bookmark.deleteMany(b);
		console.log(delBookmark);

		if (!delBookmark || delBookmark === null) {
			throw new Error(
				"Failed to unbookmark room. Database returned null after delete.",
			);
		}
	}
}
