import { Injectable } from "@nestjs/common";
import { RoomDto } from "./dto/room.dto";
import { UpdateRoomDto } from "./dto/updateroomdto";
import { SongInfoDto } from "./dto/songinfo.dto";
import { UserProfileDto } from "../profile/dto/userprofile.dto";
import { PrismaService } from "../../../prisma/prisma.service";
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

	async deleteRoom(room_id: string, room_creator: string): Promise<boolean> {
		// Check if the room exists
		// delete the room user is the owner
		var isDeleted = false;
		try {
			await this.prisma.room.delete({
				where: { room_id, room_creator }
			}).then((room) => {
				// console.log("is deleting", room);
				isDeleted = true;
			}
			);
			// console.log(isDeleted);
			return isDeleted;
		} catch (error) {
			return false;
		}
	  }

	  async joinRoom(room_id: string, user_id: string): Promise<boolean> {
		console.log("user", user_id, "joining room", room_id);
		try {
			// Check if the user is already in the room
			const room = await this.prisma.participate.findFirst({
				where: {
					room_id: room_id,
					user_id: user_id
				}
			})
	
			// If the user is already in the room, return false
			if (room !== null) {
				return false;
			}
	
			// Add the user to the room
			await this.prisma.participate.create({
				data: {
					room_id: room_id,
					user_id: user_id
				}
			});
	
			return true;
		} catch (error) {
			console.error("Error joining room:");
			return false;
		}
	}
	
	

	async leaveRoom(room_id: string, user_id: string): Promise<boolean> {
		// TODO: Implement logic to leave room
		console.log("user", user_id, "leaving room", room_id);
		try {
			// Check if the user is already in the room
			const room = await this.prisma.participate.findFirst({
				where: {
					room_id: room_id,
					user_id: user_id
				}
			})
	
			// If the user is already in the room, return false
			if (room === null) {
				return false;
			}
	
			// Add the user to the room
			await this.prisma.participate.delete({
				where: {
					participate_id: room.participate_id
				}
			});
	
			return true;
		} catch (error) {
			console.error("Error leaving room:");
			return false;
		}
	}

	async getNumFollowers(user_id: string, getFollowers: boolean): Promise<number> {
		try {
			const _where: object = getFollowers? {
				follower: user_id
			} : {
				followee: user_id
			};
			const followers: number = await this.prisma.follows.count({
				where: _where
			});
			return followers;
		} catch(error) {
			return 0;
		}
	}

	async getRoomUsers(room_id: string): Promise<UserProfileDto[]> {
        // Return empty array in case of error
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
