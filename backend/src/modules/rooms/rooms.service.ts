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
import { EmojiReactionDto } from "../../live/dto/emojireaction.dto";
import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class UserActionDto {
	@ApiProperty({
		description: "The user ID of the user that the action was performed on",
		type: "string",
		example: "123e4567-e89b-12d3-a456-426614174000",
		format: "uuid",
	})
	@IsString()
	userID: string;
}

@Injectable()
export class RoomsService {
	DUMBroomQueues: Map<string, string> = new Map<string, string>();

	constructor(
		private readonly prisma: PrismaService,
		private readonly dtogen: DtoGenService,
		private readonly dbUtils: DbUtilsService,
	) {}

	async getNewRooms(limit = -1): Promise<RoomDto[]> {
		const r: PrismaTypes.room[] = await this.prisma.room.findMany({
			orderBy: {
				date_created: "desc",
			},
		});
		if (r.length === 0) {
			return [];
		}
		const allRooms: PrismaTypes.room[] = r;

		const pr: PrismaTypes.public_room[] =
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

		const promises: Promise<RoomDto>[] = [];
		for (const room of rooms) {
			promises.push(this.dtogen.generateRoomDtoFromRoom(room));
		}
		const result: RoomDto[] = await Promise.all(promises);
		return result;
	}

	async getRoomInfo(roomID: string): Promise<RoomDto> {
		console.log("Getting room info for room", roomID);
		const room = await this.prisma.room.findFirst({
			where: {
				room_id: roomID,
			},
		});
		if (!room) {
			throw new Error("Room does not exist");
		}
		// filter out null values
		return await this.dtogen.generateRoomDtoFromRoom(room);
	}

	async updateRoomInfo(
		userID: string,
		roomID: string,
		updateRoomDto: UpdateRoomDto,
	): Promise<RoomDto> {
		if (!(await this.dbUtils.userExists(userID))) {
			throw new HttpException("User does not exist", HttpStatus.NOT_FOUND);
		}

		const r: PrismaTypes.room | null = await this.prisma.room.findFirst({
			where: {
				room_id: roomID,
			},
		});

		if (!r) {
			throw new HttpException("Room does not exist", HttpStatus.NOT_FOUND);
		}

		if (r.room_creator !== userID) {
			throw new HttpException(
				"User is not the owner of the room",
				HttpStatus.FORBIDDEN,
			);
		}

		const updatedRoom: Prisma.roomUpdateInput = {
			room_id: roomID,
		};

		if (updateRoomDto.room_name !== undefined) {
			updatedRoom.name = updateRoomDto.room_name;
		}

		if (updateRoomDto.description) {
			updatedRoom.description = updateRoomDto.description;
		}

		if (updateRoomDto.room_image !== undefined) {
			updatedRoom.playlist_photo = updateRoomDto.room_image;
		}

		if (updateRoomDto.has_explicit_content !== undefined) {
			updatedRoom.explicit = updateRoomDto.has_explicit_content;
		}

		if (updateRoomDto.has_nsfw_content !== undefined) {
			updatedRoom.nsfw = updateRoomDto.has_nsfw_content;
		}

		if (updateRoomDto.language) {
			updatedRoom.room_language = updateRoomDto.language;
		}

		try {
			const room: PrismaTypes.room | null = await this.prisma.room.update({
				where: {
					room_id: roomID,
				},
				data: updatedRoom,
			});

			if (!room) {
				throw new Error("Failed to update room");
			}

			return await this.dtogen.generateRoomDtoFromRoom(room);
		} catch (error) {
			console.error("Error updating room info:", error);
			throw error;
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

	async joinRoom(_room_id: string, user_id: string): Promise<void> {
		console.log("user", user_id, "joining room", _room_id);
		try {
			// Check if the user is already in the room
			const room = await this.prisma.participate.findFirst({
				where: {
					user_id: user_id,
				},
			});

			if (room !== null) {
				throw new HttpException(
					"User is already in the room",
					HttpStatus.CONFLICT,
				);
			}
			// Add the user to the room
			await this.prisma.participate.create({
				data: {
					room_id: _room_id,
					user_id: user_id,
				},
			});
			// add user to the user_activity table
			await this.prisma.user_activity.create({
				data: {
					room_id: _room_id,
					user_id: user_id,
					room_join_time: new Date(),
				},
			});
		} catch (error) {
			console.error("Error joining room:", error);
			throw error;
		}
	}

	async leaveRoom(room_id: string, user_id: string): Promise<void> {
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
				throw new HttpException(
					"User is not in the room",
					HttpStatus.NOT_FOUND,
				);
			}

			// Add the user to the room
			await this.prisma.participate.delete({
				where: {
					participate_id: room.participate_id,
				},
			});
			const user = await this.prisma.user_activity.findFirst({
				where: {
					room_id: room_id,
					user_id: user_id,
					room_leave_time: null,
				},
			});
			if (user === null) {
				throw new HttpException(
					"User is not in the room",
					HttpStatus.NOT_FOUND,
				);
			}
			// if the user has been successfully remove from the room, then update the room_leave_time to the user_activity table
			await this.prisma.user_activity.update({
				where: {
					activity_id: user.activity_id,
				},
				data: {
					room_leave_time: new Date(),
				},
			});
		} catch (error) {
			console.error("Error leaving room:", error);
			throw error;
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
			const ids: string[] = users.map((user) => user.user_id);
			const userDtos: UserDto[] = await this.dtogen.generateMultipleUserDto(
				ids,
			);
			return userDtos;
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

	async getRoomQueue(roomID: string): Promise<SongInfoDto[]> {
		// TODO: Implement logic to get room queue
		const songInfoDto: SongInfoDto = new SongInfoDto();
		// get queue from db
		const queue = await this.prisma.queue.findMany({
			where: {
				room_id: roomID,
			},
			include: {
				song: true,
			},
		});
		const songInfoDtos: SongInfoDto[] = [];
		for (const song of queue) {
			songInfoDto.title = song.song.name;
			songInfoDto.cover = song.song.artwork_url || "";
			songInfoDto.artists = song.song.artists;
			if (song.start_time) {
				songInfoDto.start_time = song.start_time;
			}
			songInfoDtos.push(songInfoDto);
		}
		return songInfoDtos;
	}

	getRoomQueueDUMBVERSION(roomID: string): string {
		// TODO: Implement logic to get room queue
		return this.DUMBroomQueues.get(roomID) || "";
	}

	// clearRoomQueue(userID: string, roomID: string): boolean {
	// 	// TODO: Implement logic to clear room queue
	// 	console.log(roomID);
	// 	return false;
	// }

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

		const roomMessages: PrismaTypes.room_message[] =
			await this.prisma.room_message.findMany({
				where: {
					room_id: roomID,
				},
			});

		if (roomMessages.length === 0) {
			return [];
		}

		const ids: string[] = [];
		for (const message of roomMessages) {
			ids.push(message.message_id);
		}

		const messages: PrismaTypes.message[] = await this.prisma.message.findMany({
			where: {
				message_id: {
					in: ids,
				},
			},
		});

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
		const messages: PrismaTypes.message[] = await this.getLiveChatHistory(
			roomID,
		);
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
					reaction: emojiReactionDto.body,
				},
			});
		if (!newReaction || newReaction === null) {
			throw new Error(
				"Failed to save reaction. Database returned null after insert.",
			);
		}
	}

	// define a function that will archive all the songs in a room
	async archiveRoomSongs(
		roomID: string,
		userID: string,
		archiveInfo: any,
	): Promise<void> {
		// get all the songs in the room from the queue table
		if (!(await this.dbUtils.userExists(userID))) {
			throw new HttpException("User does not exist", HttpStatus.NOT_FOUND);
		}

		if (!(await this.dbUtils.roomExists(roomID))) {
			throw new HttpException("Room does not exist", HttpStatus.NOT_FOUND);
		}

		const songs: any = await this.prisma.queue.findMany({
			where: {
				room_id: roomID,
			},
		});
		// if there are no songs in the room, return false
		if (!songs || songs === null) {
			throw new HttpException("No songs in the room", HttpStatus.NOT_FOUND);
		}
		// create a playlist as an array of song ids
		const playlist: string[] = [];
		for (const song of songs) {
			playlist.push(song.song_id);
		}

		// add the songs to the playlist table
		const result = await this.prisma.playlist.create({
			data: {
				name: archiveInfo.name,
				description: archiveInfo.description,
				user_id: userID,
				playlist: playlist,
			},
		});

		// if the playlist is created, return true
		if (result) {
			throw new HttpException("Playlist created", HttpStatus.OK);
		}
		throw new HttpException(
			"Failed to create playlist",
			HttpStatus.INTERNAL_SERVER_ERROR,
		);
	}

	async getArchivedSongs(userID: string): Promise<any> {
		// get all the playlists created by the user
		console.log("User ID: ", userID, " is getting archived songs");
		if (!(await this.dbUtils.userExists(userID))) {
			throw new HttpException("User does not exist", HttpStatus.NOT_FOUND);
		}

		const playlists: any = await this.prisma.playlist.findMany({
			where: {
				user_id: userID,
			},
		});
		// if there are no playlists, return false
		console.log("Playlists: ", playlists);
		if (!playlists || playlists === null) {
			throw new HttpException("No playlists found", HttpStatus.NOT_FOUND);
		}
		return playlists;
	}

	async deleteArchivedSongs(userID: string, playlistID: string): Promise<void> {
		// delete the playlist created by the user
		if (!(await this.dbUtils.userExists(userID))) {
			throw new HttpException("User does not exist", HttpStatus.NOT_FOUND);
		}
		console.log("User ID: ", userID, " is deleting archived songs");
		if (!(await this.dbUtils.userExists(userID))) {
			throw new HttpException("User does not exist", HttpStatus.NOT_FOUND);
		}

		const playlist: any = await this.prisma.playlist.findFirst({
			where: {
				user_id: userID,
				playlist_id: playlistID,
			},
		});
		// if the playlist does not exist, return false
		if (!playlist || playlist === null) {
			throw new HttpException("Playlist not found", HttpStatus.NOT_FOUND);
		}
		// delete the playlist
		const result = await this.prisma.playlist.delete({
			where: {
				playlist_id: playlistID,
			},
		});
		// if the playlist is deleted, return true
		if (result) {
			throw new HttpException("Playlist deleted", HttpStatus.OK);
		}
		throw new HttpException(
			"Failed to delete playlist",
			HttpStatus.INTERNAL_SERVER_ERROR,
		);
	}

	async getKickedUsers(roomID: string): Promise<UserDto[]> {
		console.log(roomID);
		// Implement the logic to get the kicked users for the room
		// if (true) {
		// 	// room does not exist
		// 	throw new HttpException("Room does not exist", HttpStatus.NOT_FOUND);
		// }
		return [];
	}

	async kickUser(
		roomID: string,
		initiatorID: string,
		kickedUserID: string,
	): Promise<void> {
		console.log(roomID);
		console.log(initiatorID);
		console.log(kickedUserID);
		// Implement the logic to kick a user from the room
		if (true) {
			// room does not exist
			throw new HttpException("Room does not exist", HttpStatus.NOT_FOUND);
		}

		// if (true) {
		// 	// user does not exist
		// 	throw new HttpException("User does not exist", HttpStatus.NOT_FOUND);
		// }

		// if (true) {
		// 	// user does not have permission to kick
		// 	throw new HttpException("User is not in the room", HttpStatus.FORBIDDEN);
		// }

		// if (true) {
		// 	// user is not in the room
		// 	throw new HttpException(
		// 		"User is not in the room",
		// 		HttpStatus.BAD_REQUEST,
		// 	);
		// }

		// if (true) {
		// 	// user is trying to kick themselves
		// 	throw new HttpException("User is the initiator", HttpStatus.BAD_REQUEST);
		// }
	}

	async undoKick(
		roomID: string,
		initiatorID: string,
		kickedUserID: string,
	): Promise<void> {
		console.log(roomID);
		console.log(initiatorID);
		console.log(kickedUserID);
		// Implement the logic to undo the kick of a participant in the room
		if (true) {
			// room does not exist
			throw new HttpException("Room does not exist", HttpStatus.NOT_FOUND);
		}

		// if (true) {
		// 	// user does not exist
		// 	throw new HttpException("User does not exist", HttpStatus.NOT_FOUND);
		// }

		// if (true) {
		// 	// user does not have permission to kick
		// 	throw new HttpException("User is not in the room", HttpStatus.FORBIDDEN);
		// }

		// if (true) {
		// 	// user is trying to undo their own kick
		// 	throw new HttpException("User is the initiator", HttpStatus.BAD_REQUEST);
		// }
	}

	async getBannedUsers(roomID: string): Promise<UserDto[]> {
		// Implement the logic to get the banned users for the room
		console.log(roomID);
		if (true) {
			// room does not exist
			throw new HttpException("Room does not exist", HttpStatus.NOT_FOUND);
		}
		return [];
	}

	async banUser(
		roomID: string,
		initiatorID: string,
		bannedUserID: string,
	): Promise<void> {
		// Implement the logic to ban a user from the room
		console.log(roomID);
		console.log(initiatorID);
		console.log(bannedUserID);
		if (true) {
			// room does not exist
			throw new HttpException("Room does not exist", HttpStatus.NOT_FOUND);
		}

		// if (true) {
		// 	// user does not exist
		// 	throw new HttpException("User does not exist", HttpStatus.NOT_FOUND);
		// }

		// if (true) {
		// 	// user does not have permission to ban
		// 	throw new HttpException("User is not in the room", HttpStatus.FORBIDDEN);
		// }

		// if (true) {
		// 	// user is trying to ban themselves
		// 	throw new HttpException("User is the initiator", HttpStatus.BAD_REQUEST);
		// }
	}

	async undoBan(
		roomID: string,
		initiatorID: string,
		bannedUserID: string,
	): Promise<void> {
		// Implement the logic to undo the ban of a participant in the room
		console.log(roomID);
		console.log(initiatorID);
		console.log(bannedUserID);
		if (true) {
			// room does not exist
			throw new HttpException("Room does not exist", HttpStatus.NOT_FOUND);
		}

		// if (true) {
		// 	// user does not exist
		// 	throw new HttpException("User does not exist", HttpStatus.NOT_FOUND);
		// }

		// if (true) {
		// 	// user does not have permission to ban
		// 	throw new HttpException("User is not in the room", HttpStatus.FORBIDDEN);
		// }

		// if (true) {
		// 	// user is trying to undo their own ban
		// 	throw new HttpException("User is the initiator", HttpStatus.BAD_REQUEST);
		// }
	}

	async getCalendarFile(roomID: string): Promise<File> {
		// Implement the logic to get the calendar file for the room
		// if (true) {
		// 	// room does not exist
		// 	throw new HttpException("Room does not exist", HttpStatus.NOT_FOUND);
		// }
		// if (true) {
		// 	// room does not have any events
		// 	throw new HttpException(
		// 		"Room does not have any events",
		// 		HttpStatus.NOT_FOUND,
		// 	);
		// }
		console.log(roomID);
		const bytes: BlobPart[] = [];
		return new File(bytes, "calendar.ics");
	}

	async splitRoom(roomID: string): Promise<RoomDto> {
		// Implement the logic to split the room
		if (true) {
			// room does not exist
			throw new HttpException("Room does not exist", HttpStatus.NOT_FOUND);
		}
		//split the room
		//set the children ids to RoomDto.children
		//return RoomDto
		console.log(roomID);
	}

	async canSplitRoom(roomID: string): Promise<string[]> {
		// Implement the logic to check if the room can be split
		// if (true) {
		// 	// room does not exist
		// 	throw new HttpException("Room does not exist", HttpStatus.NOT_FOUND);
		// }
		console.log(roomID);
		const childGenres: string[] = [];
		return childGenres;
	}
}
