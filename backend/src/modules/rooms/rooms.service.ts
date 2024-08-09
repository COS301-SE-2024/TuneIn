import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { RoomDto } from "./dto/room.dto";
import { UpdateRoomDto } from "./dto/updateroomdto";
import { SongInfoDto } from "./dto/songinfo.dto";
import { UserDto } from "../users/dto/user.dto";
import { PrismaService } from "../../../prisma/prisma.service";
import * as PrismaTypes from "@prisma/client";
import { Prisma } from "@prisma/client";
import { DtoGenService } from "../dto-gen/dto-gen.service";
import { DbUtilsService } from "../db-utils/db-utils.service";
import { LiveChatMessageDto } from "../../live/dto/livechatmessage.dto";
import {
	RoomAnalyticsQueueDto,
	RoomAnalyticsParticipationDto,
	RoomAnalyticsInteractionsDto,
	RoomAnalyticsVotesDto,
	RoomAnalyticsSongsDto,
	RoomAnalyticsContributorsDto,
	RoomAnalyticsDto,
} from "./dto/roomanalytics.dto";
import { EmojiReactionDto } from "src/live/dto/emojireaction.dto";

@Injectable()
export class RoomsService {
	DUMBroomQueues: Map<string, string> = new Map<string, string>();

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
		try {
			const room = await this.prisma.room.findFirst({
				where: {
					room_id: roomID,
				},
			});
			if (!room) {
				return new RoomDto();
			}
			// filter out null values
			const roomDto = await this.dtogen.generateRoomDtoFromRoom(room);
			return roomDto ? roomDto : new RoomDto();
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

	async updateRoomInfo(
		roomID: string,
		updateRoomDto: UpdateRoomDto,
	): Promise<RoomDto> {
		// TODO: Implement logic to update room info
		const data = {
			name: updateRoomDto.room_name!,
			description: updateRoomDto.description!,
			playlist_photo: updateRoomDto.room_image!,
			explicit: updateRoomDto.has_explicit_content!,
			nsfw: updateRoomDto.has_explicit_content!,
			room_language: updateRoomDto.language!,
		};

		Object.keys(data).forEach(
			(key) =>
				data[key as keyof typeof data] === undefined &&
				delete data[key as keyof typeof data],
		);

		console.log("Updating room", roomID, "with data", data);
		try {
			const room = await this.prisma.room.update({
				where: {
					room_id: roomID,
				},
				data: data,
			});
			const updatedRoom = room
				? await this.dtogen.generateRoomDtoFromRoom(room)
				: new RoomDto();
			return updatedRoom ? updatedRoom : new RoomDto();
		} catch (error) {
			console.error("Error updating room info:", error);
			return new RoomDto();
		}
	}

	async deleteRoom(room_id: string, room_creator: string): Promise<boolean> {
		// Check if the room exists
		// delete the room user is the owner
		let isDeleted = false;
		try {
			await this.prisma.room
				.delete({
					where: { room_id, room_creator },
				})
				.then((room) => {
					console.log("deleting", room);
					isDeleted = true;
				});
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
					user_id: user_id,
				},
			});

			if (room !== null) {
				return false;
			}
			// Add the user to the room
			await this.prisma.participate.create({
				data: {
					room_id: room_id,
					user_id: user_id,
				},
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
					user_id: user_id,
				},
			});

			// If the user is already in the room, return false
			if (room === null) {
				return false;
			}

			// Add the user to the room
			await this.prisma.participate.delete({
				where: {
					participate_id: room.participate_id,
				},
			});

			return true;
		} catch (error) {
			console.error("Error leaving room:");
			return false;
		}
	}

	async getNumFollowers(
		user_id: string,
		getFollowers: boolean,
	): Promise<number> {
		try {
			const _where: object = getFollowers
				? {
						follower: user_id,
					}
				: {
						followee: user_id,
					};
			const followers: number = await this.prisma.follows.count({
				where: _where,
			});
			return followers;
		} catch (error) {
			return 0;
		}
	}

	async getRoomUsers(room_id: string): Promise<UserDto[]> {
		try {
			// write a query to get all the users in the room
			const users = await this.prisma.participate.findMany({
				where: {
					room_id: room_id,
				},
				include: {
					users: true,
				},
			});

			// map all the users to the userdto
			console.log("Users in room", users);
			const userDtos: (UserDto | null)[] = await Promise.all(
				users.map(async (user) => {
					const u = await this.dtogen.generateUserDto(user.users.user_id);
					return u;
				}),
			);

			// filter out null values
			const filteredUsers: UserDto[] = userDtos.filter(
				(u) => u !== null,
			) as UserDto[];
			console.log("Filtered users", filteredUsers);
			return filteredUsers;
		} catch (error) {
			console.error("Error getting room users:", error);
			return [];
		}
	}

	async getRoomUserCount(room_id: string): Promise<number> {
		try {
			const count = await this.prisma.participate.count({
				where: {
					room_id: room_id,
				},
			});
			return count;
		} catch (error) {
			return -1;
		}
	}

	getRoomQueue(roomID: string): SongInfoDto[] {
		// TODO: Implement logic to get room queue
		console.log(roomID);
		return [];
	}

	getRoomQueueDUMBVERSION(roomID: string): string {
		// TODO: Implement logic to get room queue
		return this.DUMBroomQueues.get(roomID) || "";
	}

	clearRoomQueue(roomID: string): boolean {
		// TODO: Implement logic to clear room queue
		console.log(roomID);
		return false;
	}

	addSongToQueue(roomID: string, songInfoDto: SongInfoDto): SongInfoDto[] {
		// TODO: Implement logic to add song to queue
		console.log(roomID);
		console.log(songInfoDto);
		return [];
	}

	addSongToQueueDUMBVERSION(roomID: string, songID: string): string {
		// Replace the old queue with a new queue containing only the new song
		/*
		console.log("input", songID);
		const songObjects: { songID: string }[] = JSON.parse(songID);
		const queue: string[] = songObjects.map((obj) => JSON.stringify(obj));
		*/
		this.DUMBroomQueues.set(roomID, songID);
		return songID;
	}

	getCurrentSong(roomID: string): SongInfoDto {
		// TODO: Implement logic to get current playing song
		console.log(roomID);
		return new SongInfoDto();
	}

	async roomExists(roomID: string): Promise<boolean> {
		const room: PrismaTypes.room | null = await this.prisma.room.findUnique({
			where: {
				room_id: roomID,
			},
		});
		if (!room || room === null) {
			return false;
		}
		return true;
	}

	async getLiveChatHistory(roomID: string): Promise<PrismaTypes.message[]> {
		if (!(await this.roomExists(roomID))) {
			throw new HttpException(
				"Room with id '" + roomID + "' does not exist",
				HttpStatus.NOT_FOUND,
			);
		}

		const roomMessages: PrismaTypes.room_message[] | null =
			await this.prisma.room_message.findMany({
				where: {
					room_id: roomID,
				},
			});

		if (!roomMessages || roomMessages === null) {
			throw new Error(
				"Failed to get chat history (query returned null) for room with id '" +
					roomID +
					"'",
			);
		}

		if (roomMessages.length === 0) {
			return [];
		}

		const ids: string[] = [];
		for (const message of roomMessages) {
			ids.push(message.message_id);
		}

		const messages: PrismaTypes.message[] | null =
			await this.prisma.message.findMany({
				where: {
					message_id: {
						in: ids,
					},
				},
			});

		if (!messages || messages === null) {
			throw new Error(
				"Failed to get chat history (query returned null) for room with id '" +
					roomID +
					"'",
			);
		}

		if (messages.length === 0) {
			throw new Error(
				"Failed to get chat history (no messages found) matching IDs for room with id '" +
					roomID +
					"'. DB may be corrupted.",
			);
		}
		return messages;
	}

	async getLiveChatHistoryDto(roomID: string): Promise<LiveChatMessageDto[]> {
		const messages: PrismaTypes.message[] =
			await this.getLiveChatHistory(roomID);
		const result: LiveChatMessageDto[] =
			await this.dtogen.generateMultipleLiveChatMessageDto(messages);
		return result;
	}

	async createMessage(message: Prisma.messageCreateInput): Promise<string> {
		const newMessage: PrismaTypes.message | null =
			await this.prisma.message.create({
				data: message,
			});

		if (!newMessage || newMessage === null) {
			throw new Error(
				"Failed to create message with id '" +
					message.message_id +
					"'. Unknown database error",
			);
		}

		return newMessage.message_id;
	}

	async createLiveChatMessage(
		message: LiveChatMessageDto,
		userID?: string,
	): Promise<string> {
		if (!(await this.roomExists(message.roomID))) {
			throw new Error("Room with id '" + message.roomID + "' does not exist");
		}

		let u: string = message.sender.userID;
		if (userID) {
			u = userID;
		}
		const sender: PrismaTypes.users | null = await this.prisma.users.findUnique(
			{
				where: {
					user_id: u,
				},
			},
		);

		if (!sender || sender === null) {
			throw new Error(
				"Failed to get user with id '" +
					u +
					"' and name '" +
					message.sender.username +
					"'",
			);
		}

		const newMessage: Prisma.messageCreateInput = {
			contents: message.messageBody,
			users: {
				connect: {
					user_id: sender.user_id,
				},
			},
		};

		const messageID: string = await this.createMessage(newMessage);

		const roomMessage: PrismaTypes.room_message | null =
			await this.prisma.room_message.create({
				data: {
					room_id: message.roomID,
					message_id: messageID,
				},
			});

		if (!roomMessage || roomMessage === null) {
			throw new Error(
				"Failed to create room message for room with id '" +
					message.roomID +
					"'. Unknown database error",
			);
		}
		return messageID;
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

	async getRoomAnalytics(
		roomID: string,
		userID: string,
	): Promise<RoomAnalyticsDto> {
		console.log(
			"Getting room analytics for room",
			roomID,
			" and given userID: ",
			userID,
		);
		return new RoomAnalyticsDto();
	}

	async getRoomQueueAnalytics(
		roomID: string,
		userID: string,
	): Promise<RoomAnalyticsQueueDto> {
		console.log(
			"Getting room analytics for room",
			roomID,
			" and given userID: ",
			userID,
		);
		return new RoomAnalyticsQueueDto();
	}

	async getRoomParticipationAnalytics(
		roomID: string,
		userID: string,
	): Promise<RoomAnalyticsParticipationDto> {
		console.log(
			"Getting room analytics for room",
			roomID,
			" and given userID: ",
			userID,
		);
		return new RoomAnalyticsParticipationDto();
	}

	async getRoomInteractionAnalytics(
		roomID: string,
		userID: string,
	): Promise<RoomAnalyticsInteractionsDto> {
		console.log(
			"Getting room analytics for room",
			roomID,
			" and given userID: ",
			userID,
		);
		return new RoomAnalyticsInteractionsDto();
	}

	async getRoomVotesAnalytics(
		roomID: string,
		userID: string,
	): Promise<RoomAnalyticsVotesDto> {
		console.log(
			"Getting room analytics for room",
			roomID,
			" and given userID: ",
			userID,
		);
		return new RoomAnalyticsVotesDto();
	}

	async getRoomSongsAnalytics(
		roomID: string,
		userID: string,
	): Promise<RoomAnalyticsSongsDto> {
		console.log(
			"Getting room analytics for room",
			roomID,
			" and given userID: ",
			userID,
		);
		return new RoomAnalyticsSongsDto();
	}

	async getRoomContributorsAnalytics(
		roomID: string,
		userID: string,
	): Promise<RoomAnalyticsContributorsDto> {
		console.log(
			"Getting room analytics for room",
			roomID,
			" and given userID: ",
			userID,
		);
		return new RoomAnalyticsContributorsDto();
	}

	async saveReaction(
		roomID: string,
		emojiReactionDto: EmojiReactionDto,
	): Promise<void> {
		if (!(await this.roomExists(roomID))) {
			throw new Error("Room with id '" + roomID + "' does not exist");
		}

		const userID = emojiReactionDto.userID;
		if (!(await this.dbUtils.userExists(userID))) {
			throw new Error("User with id '" + userID + "' does not exist");
		}

		const newReaction: PrismaTypes.chat_reactions | null =
			await this.prisma.chat_reactions.create({
				data: {
					user_id: userID,
					room_id: roomID,
					reaction: JSON.stringify(emojiReactionDto.body),
				},
			});
		if (!newReaction || newReaction === null) {
			throw new Error(
				"Failed to save reaction. Database returned null after insert.",
			);
		}
	}
}
