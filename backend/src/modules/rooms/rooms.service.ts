import { Injectable } from "@nestjs/common";
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

	async getRoomInfo(roomID: string): Promise<RoomDto> {
		// TODO: Implement logic to get room info
		// an an example to generate a RoomDto
		/*
		const roomID = "xxxx"
		const room = await this.dtogen.generateRoomDto(roomID);
		if (room) {
			return room;
		}
		*/
		try{
			const room = await this.prisma.room.findFirst({
				where: {
					room_id: roomID
				}
			});
			if (!room) {
				return new RoomDto();
			}
			// filter out null values
			const roomDto = await this.dtogen.generateRoomDtoFromRoom(room);
			return roomDto? roomDto : new RoomDto();
		} catch (error) {
			console.error("Error getting room info:", error);
			return new RoomDto();
		}
		// const room = await this.prisma.room.findFirst({
		// 	where: {
		// 		room_id: roomID
		// 	}
		// });
		// if (!room) {
		// 	return new RoomDto();
		// }
		// // filter out null values
		// const roomDto = await this.dtogen.generateRoomDtoFromRoom(room);
		// return roomDto? roomDto : new RoomDto();
	}

	async updateRoomInfo(roomID: string, updateRoomDto: UpdateRoomDto): Promise<RoomDto> {
		// TODO: Implement logic to update room info
		const data = {
			name: updateRoomDto.room_name!,
			description: updateRoomDto.description!,
			playlist_photo: updateRoomDto.room_image!,
			explicit: updateRoomDto.has_explicit_content!,
			nsfw: updateRoomDto.has_explicit_content!,
			room_language: updateRoomDto.language!
		}

		Object.keys(data).forEach(key => data[key as keyof typeof data] === undefined && delete data[key as keyof typeof data]);

		console.log("Updating room", roomID, "with data", data)
		try{
			const room = await this.prisma.room.update({
				where: {
					room_id: roomID
				},
				data: data
			});
			const updatedRoom = room? await this.dtogen.generateRoomDtoFromRoom(room): new RoomDto();
			return updatedRoom? updatedRoom : new RoomDto();
		} catch (error) {
			console.error("Error updating room info:", error);
			return new RoomDto();
		}
	}

	updateRoom(roomID: string, updateRoomDto: UpdateRoomDto): RoomDto {
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
		try {
			// write a query to get all the users in the room
			const users = await this.prisma.participate.findMany({
				where: {
					room_id: room_id
				},
				include: {
					users: true
				}
			});
			// map all the users to the userprofiledto
			console.log("Users in room", users);
			const userProfiles: (UserProfileDto | null)[] = await Promise.all(users.map(async (user) => {
				const userProfile = await this.dtogen.generateUserProfileDto(user.users.user_id);
				return userProfile;
			}));
	
			// filter out null values
			const filteredUserProfiles: UserProfileDto[] = userProfiles.filter((userProfile) => userProfile !== null) as UserProfileDto[];
			console.log("Filtered user profiles", filteredUserProfiles);
			return filteredUserProfiles;
		} catch (error) {
			console.error("Error getting room users:", error);
			return [];
		}
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

	async bookmarkRoom(roomID: string, userID: string): Promise<void> {}

	async unbookmarkRoom(roomID: string, userID: string): Promise<void> {}
}
