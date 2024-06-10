import { Injectable } from "@nestjs/common";
import { RoomDto } from "./dto/room.dto";
import { UpdateRoomDto } from "./dto/updateroomdto";
import { SongInfoDto } from "./dto/songinfo.dto";
import { UserProfileDto } from "../profile/dto/userprofile.dto";
import { PrismaService } from "../../../prisma/prisma.service";
import * as Prisma from "@prisma/client";
import { DtoGenService } from "../dto-gen/dto-gen.service";
import { DbUtilsService } from "../db-utils/db-utils.service";

@Injectable()
export class RoomsService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly dtogen: DtoGenService,
		private readonly dbUtils: DbUtilsService,
	) {}

	getNewRooms(): RoomDto[] {
		// an an example to generate a RoomDto
		/*
		const room_id = "xxxx"
		const room = await this.dtogen.generateRoomDto(room_id);
		if (room) {
			return room;
		}
		*/

		return [];
	}

	getRoomInfo(room_id: string): RoomDto {
		// TODO: Implement logic to get room info
		return new RoomDto();
	}

	updateRoomInfo(room_id: string, updateRoomDto: UpdateRoomDto): RoomDto {
		// TODO: Implement logic to update room info
		return new RoomDto();
	}

	updateRoom(room_id: string, updateRoomDto: UpdateRoomDto): RoomDto {
		// TODO: Implement logic to update room
		return new RoomDto();
	}

	deleteRoom(room_id: string): boolean {
		// TODO: Implement logic to delete room
		return false;
	}

	joinRoom(room_id: string): boolean {
		// TODO: Implement logic to join room
		return false;
	}

	leaveRoom(room_id: string): boolean {
		// TODO: Implement logic to leave room
		return false;
	}

	getRoomUsers(room_id: string): UserProfileDto[] {
		// TODO: Implement logic to get room users
		return [];
	}

	getRoomQueue(room_id: string): SongInfoDto[] {
		// TODO: Implement logic to get room queue
		return [];
	}

	clearRoomQueue(room_id: string): boolean {
		// TODO: Implement logic to clear room queue
		return false;
	}

	addSongToQueue(room_id: string, songInfoDto: SongInfoDto): SongInfoDto[] {
		// TODO: Implement logic to add song to queue
		return [];
	}

	getCurrentSong(room_id: string): SongInfoDto {
		// TODO: Implement logic to get current playing song
		return new SongInfoDto();
	}
}
