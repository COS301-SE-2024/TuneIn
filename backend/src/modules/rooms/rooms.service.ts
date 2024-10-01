import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { RoomDto } from "./dto/room.dto";
import { UpdateRoomDto } from "./dto/updateroomdto";
import { UserDto } from "../users/dto/user.dto";
import { PrismaService } from "../../../prisma/prisma.service";
import * as PrismaTypes from "@prisma/client";
import { Prisma } from "@prisma/client";
import { DtoGenService } from "../dto-gen/dto-gen.service";
import {
	DbUtilsService,
	FullyQualifiedRoom,
} from "../db-utils/db-utils.service";
import { LiveChatMessageDto } from "../../live/dto/livechatmessage.dto";
import { EmojiReactionDto } from "../../live/dto/emojireaction.dto";
import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";
import { SpotifyService } from "../../spotify/spotify.service";
import { RoomQueueService, ActiveRoom } from "./roomqueue/roomqueue.service";
import { RoomSongDto } from "./dto/roomsong.dto";
import { SpotifyTokenPair } from "../../../src/auth/spotify/spotifyauth.service";
import { kmeans } from "ml-kmeans";
import { KMeansResult } from "ml-kmeans/lib/KMeansResult";
import * as Spotify from "@spotify/web-api-ts-sdk";
import { Server } from "socket.io";
import { DirectMessageDto } from "../users/dto/dm.dto";
import { DmUsersService } from "../../live/dmusers/dmusers.service";

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
	// DUMBroomQueues: Map<string, string> = new Map<string, string>();
	public server: Server | undefined;

	constructor(
		private readonly prisma: PrismaService,
		private readonly dtogen: DtoGenService,
		private readonly dbUtils: DbUtilsService,
		private readonly spotifyService: SpotifyService,
		private readonly roomQueueService: RoomQueueService,
		private readonly dmUsersService: DmUsersService,
	) {}

	async getNewRooms(limit = -1): Promise<RoomDto[]> {
		const rooms: FullyQualifiedRoom[] = await this.prisma.room.findMany({
			where: {
				NOT: {
					public_room: null,
				},
			},
			include: {
				child_room_child_room_parent_room_idToroom: true,
				participate: true,
				private_room: true,
				public_room: true,
				scheduled_room: true,
			},
			orderBy: {
				date_created: "desc",
			},
		});
		if (rooms.length === 0) {
			return [];
		}
		if (limit > 0) {
			rooms.splice(limit);
		}
		return await this.dtogen.generateMultipleRoomDtoFromRoom(rooms);
	}

	async getRoomInfo(roomID: string): Promise<RoomDto> {
		console.log("Getting room info for room", roomID);
		const room: FullyQualifiedRoom | null = await this.prisma.room.findFirst({
			where: {
				room_id: roomID,
			},
			include: {
				child_room_child_room_parent_room_idToroom: true,
				participate: true,
				private_room: true,
				public_room: true,
				scheduled_room: true,
			},
		});
		if (room === null) {
			throw new Error("Room does not exist");
		}
		// filter out null values
		const rooms: RoomDto[] = await this.dtogen.generateMultipleRoomDtoFromRoom([
			room,
		]);
		const result: RoomDto = rooms[0];
		const currentSong: RoomSongDto | undefined = await this.getCurrentSong(
			roomID,
		);
		if (currentSong) {
			result.current_song = currentSong;
		}
		return result;
	}

	async getMultipleRoomInfo(roomIDs: string[]): Promise<RoomDto[]> {
		console.log("Getting room info for rooms", roomIDs);
		const rooms: FullyQualifiedRoom[] =
			await this.dbUtils.getFullyQualifiedRooms(roomIDs);
		roomIDs.map((roomID) => {
			if (!rooms.find((r) => r.room_id === roomID)) {
				throw new HttpException(
					"Room with id '" + roomID + "' does not exist",
					HttpStatus.NOT_FOUND,
				);
			}
		});
		const result: RoomDto[] = await this.dtogen.generateMultipleRoomDtoFromRoom(
			rooms,
		);
		const currentSongs: (RoomSongDto | undefined)[] =
			this.getCurrentSongs(roomIDs);
		for (let i = 0; i < result.length; i++) {
			const c = currentSongs[i];
			if (c) {
				result[i].current_song = c;
			}
		}
		return result;
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
			const room: FullyQualifiedRoom = await this.prisma.room.update({
				where: {
					room_id: roomID,
				},
				data: updatedRoom,
				include: {
					child_room_child_room_parent_room_idToroom: true,
					participate: true,
					private_room: true,
					public_room: true,
					scheduled_room: true,
				},
			});

			const rooms = await this.dtogen.generateMultipleRoomDtoFromRoom([room]);
			return rooms[0];
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

	getRoomQueue(roomID: string): RoomSongDto[] {
		const room: ActiveRoom | undefined =
			this.roomQueueService.roomQueues.get(roomID);
		if (!room) {
			//room is inactive
			return [];
		} else {
			return room.queueAsRoomSongDto();
		}
	}

	async getCurrentSong(roomID: string): Promise<RoomSongDto | undefined> {
		const queue: RoomSongDto[] = await this.getRoomQueue(roomID);
		if (queue.length === 0) {
			return undefined;
		}
		const result: RoomSongDto = queue[0];
		return result;
	}

	getCurrentSongs(roomIDs: string[]): (RoomSongDto | undefined)[] {
		const queues: RoomSongDto[][] = roomIDs.map((roomID) => {
			return this.getRoomQueue(roomID);
		});
		return queues.map((queue) => {
			if (queue.length === 0) {
				return undefined;
			}
			return queue[0];
		});
	}

	async getLiveChatHistory(roomID: string): Promise<PrismaTypes.message[]> {
		if (!(await this.dbUtils.roomExists(roomID))) {
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
		if (!(await this.dbUtils.roomExists(message.roomID))) {
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
		if (!(await this.dbUtils.roomExists(roomID))) {
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
		try {
			// Fetch audio features of the songs in the room queue
			// check if the room already has child rooms
			const childRooms: PrismaTypes.child_room[] | null =
				await this.prisma.child_room.findMany({
					where: {
						parent_room_id: roomID,
					},
				});
			console.log("Child rooms", childRooms);
			if (!childRooms || childRooms.length !== 0) {
				throw new HttpException(
					"Room already has child rooms",
					HttpStatus.BAD_REQUEST,
				);
			}
			const audioFeatures: (Spotify.AudioFeatures & {
				genre: string;
				songID: string;
			})[] = await this.getAudioFeatures(roomID);
			if (!audioFeatures || audioFeatures.length === 0) {
				throw new HttpException(
					"Room does not have any events",
					HttpStatus.NOT_FOUND,
				);
			}
			console.log("Audio features");

			const features: number[][] = audioFeatures.map((song) => [
				song.danceability,
				song.energy,
				song.key,
				song.loudness,
				song.mode,
				song.speechiness,
				song.acousticness,
				song.instrumentalness,
				song.liveness,
				song.valence,
				song.tempo,
			]);

			// Apply K-means clustering with convergence check
			const maxIterations = 100;
			const distinctivenessThreshold = 0.5; // Define your threshold
			let clusters: KMeansResult = kmeans(features, 2, { maxIterations: 20 });
			let canSplit = false;
			for (let i = 0; i < maxIterations; i++) {
				clusters = kmeans(features, 2, { maxIterations: 20 });
				if (this.checkConvergence(clusters, distinctivenessThreshold)) {
					canSplit = true;
				}
			}
			console.log("Clusters", clusters);
			if (!canSplit) {
				throw new HttpException("Room cannot be split", HttpStatus.BAD_REQUEST);
			}

			console.log("Splitting room");

			// Assign songs to sub-rooms based on clusters
			const subRooms = [0, 1].map((cluster: number) => {
				return audioFeatures.filter(
					(_, index) => clusters.clusters[index] === cluster,
				);
			});
			console.log("Sub-rooms", subRooms);
			const childGenres = subRooms.map((subRoom) =>
				this.genresFromCluster(subRoom.map((song) => song.genre)),
			);

			console.log(childGenres);
			if (childGenres.length < 2) {
				throw new HttpException("No genres found", HttpStatus.BAD_REQUEST);
			}

			// Create new rooms for the sub-rooms
			const parentRoom: PrismaTypes.room | null =
				await this.prisma.room.findFirst({
					where: {
						room_id: roomID,
					},
				});
			if (!parentRoom) {
				throw new HttpException("Parent room not found", HttpStatus.NOT_FOUND);
			}
			try {
				const childRoom0: PrismaTypes.room | null =
					await this.prisma.room.create({
						data: {
							name: parentRoom.name + " - " + childGenres[0],
							description: parentRoom.description,
							room_creator: parentRoom.room_creator,
							playlist_photo: parentRoom.playlist_photo,
							explicit: parentRoom.explicit,
							nsfw: parentRoom.nsfw,
							room_language: parentRoom.room_language,
							tags: [childGenres[0] ?? "vibe"],
						},
					});
				const childRoom1: PrismaTypes.room | null =
					await this.prisma.room.create({
						data: {
							name: parentRoom.name + " - " + childGenres[1],
							description: parentRoom.description,
							room_creator: parentRoom.room_creator,
							playlist_photo: parentRoom.playlist_photo,
							explicit: parentRoom.explicit,
							nsfw: parentRoom.nsfw,
							room_language: parentRoom.room_language,
							tags: [childGenres[1] ?? "vibe"],
						},
					});

				if (!childRoom0 || !childRoom1) {
					throw new HttpException(
						"Failed to create child rooms",
						HttpStatus.INTERNAL_SERVER_ERROR,
					);
				}

				await this.prisma.child_room.create({
					data: {
						parent_room_id: parentRoom.room_id,
						room_id: childRoom0.room_id,
					},
				});

				await this.prisma.child_room.create({
					data: {
						parent_room_id: parentRoom.room_id,
						room_id: childRoom1.room_id,
					},
				});

				// Move songs to sub-rooms
				const childRoom0Songs:
					| { room_id: string; song_id: string }[]
					| undefined = subRooms[0]?.map((song) => {
					return {
						room_id: childRoom0.room_id,
						song_id: song.songID,
					};
				});
				const childRoom1Songs:
					| { room_id: string; song_id: string }[]
					| undefined = subRooms[1]?.map((song) => {
					return {
						room_id: childRoom1.room_id,
						song_id: song.songID,
					};
				});
				if (childRoom0Songs) {
					console.log("Child room 0 songs", childRoom0Songs);
					await this.prisma.queue.createMany({
						data: childRoom0Songs,
					});
				}
				if (childRoom1Songs) {
					await this.prisma.queue.createMany({
						data: childRoom1Songs,
					});
				}
				const [parentRoomDto]: RoomDto[] =
					await this.dtogen.generateMultipleRoomDto([roomID]);
				parentRoomDto.childrenRoomIDs = [
					childRoom0.room_id,
					childRoom1.room_id,
				];
				return parentRoomDto;
			} catch (error) {
				throw new HttpException(
					"Failed to create child rooms",
					HttpStatus.INTERNAL_SERVER_ERROR,
				);
			}
		} catch (error) {
			console.error("Error splitting room:", error);
			throw error;
		}
	}
	async canSplitRoom(roomID: string): Promise<string[]> {
		try {
			// Fetch audio features of the songs in the room queue
			const childrenRoom: PrismaTypes.child_room[] | null =
				await this.prisma.child_room.findMany({
					where: {
						parent_room_id: roomID,
					},
				});
			if (!childrenRoom || childrenRoom.length !== 0) {
				throw new HttpException(
					"Room already has child rooms",
					HttpStatus.BAD_REQUEST,
				);
			}
			const audioFeatures: (Spotify.AudioFeatures & { genre: string })[] =
				await this.getAudioFeatures(roomID);
			if (!audioFeatures || audioFeatures.length === 0) {
				throw new HttpException(
					"Room does not have any events",
					HttpStatus.NOT_FOUND,
				);
			}

			const features: number[][] = audioFeatures.map((song) => [
				song.danceability,
				song.energy,
				song.key,
				song.loudness,
				song.mode,
				song.speechiness,
				song.acousticness,
				song.instrumentalness,
				song.liveness,
				song.valence,
				song.tempo,
			]);

			// Apply K-means clustering with convergence check
			const maxIterations = 100;
			const distinctivenessThreshold = 0.5; // Define your threshold
			let clusters: KMeansResult = kmeans(features, 2, { maxIterations: 20 });
			let canSplit = false;
			for (let i = 0; i < maxIterations; i++) {
				clusters = kmeans(features, 2, { maxIterations: 20 });
				if (this.checkConvergence(clusters, distinctivenessThreshold)) {
					canSplit = true;
				}
			}
			if (!canSplit) {
				throw new HttpException("Room cannot be split", HttpStatus.BAD_REQUEST);
			}

			// Assign songs to sub-rooms based on clusters
			console.log("Number of subrooms:", clusters.clusters);
			const subRooms = [0, 1].map((cluster: number) => {
				return audioFeatures.filter(
					(_, index) => clusters.clusters[index] === cluster,
				);
			});

			const childGenres = subRooms.map((subRoom) =>
				this.genresFromCluster(subRoom.map((song) => song.genre)),
			);

			console.log(childGenres);
			const distinctGenres = [...new Set(childGenres)];
			if (distinctGenres.length < 2) {
				throw new HttpException("No genres found", HttpStatus.BAD_REQUEST);
			}
			return distinctGenres;
		} catch (error) {
			console.error("Error splitting room:", error);
			throw error;
		}
	}

	checkConvergence(clusters: KMeansResult, threshold: number): boolean {
		const centroids = clusters.centroids;
		let minDistance = Infinity;

		for (let i = 0; i < centroids.length; i++) {
			for (let j = i + 1; j < centroids.length; j++) {
				const distance = this.euclideanDistance(
					centroids[i] ?? [],
					centroids[j] ?? [],
				);
				if (distance < minDistance) {
					minDistance = distance;
				}
			}
		}

		return minDistance > threshold;
	}

	euclideanDistance(point1: number[], point2: number[]): number {
		let sum = 0;
		console.log(point1);
		for (let i = 0; i < point1.length; i++) {
			const val1: number = point1[i] ?? 0;
			const val2: number = point2[i] ?? 0;
			if (val1 === undefined || val2 === undefined) {
				break;
			}
			sum += Math.pow(val1 - val2, 2);
		}
		return Math.sqrt(sum);
	}

	async getAudioFeatures(
		roomID: string,
	): Promise<(Spotify.AudioFeatures & { genre: string; songID: string })[]> {
		// Implement the logic to get the audio features for a song
		const songs: (PrismaTypes.queue & { song: PrismaTypes.song })[] =
			await this.prisma.queue.findMany({
				where: {
					room_id: roomID,
				},
				include: {
					song: true,
				},
			});
		console.log("Songs", songs);
		return songs.map((song) => {
			return {
				...(JSON.parse(
					song.song.audio_features as unknown as string,
				) as unknown as Spotify.AudioFeatures),
				genre: song.song.genre ?? "Unknown",
				songID: song.song.song_id,
			};
		});
	}
	genresFromCluster(cluster: string[]): string {
		const genreCounts: { [genre: string]: number } = {};
		cluster.forEach((genre) => {
			if (genre in genreCounts && genreCounts[genre]) {
				genreCounts[genre]++;
			} else {
				genreCounts[genre] = 1;
			}
		});

		const sortedGenres = Object.keys(genreCounts).sort(
			(genre1, genre2) =>
				(genreCounts[genre2] ?? 0) - (genreCounts[genre1] ?? 0),
		);

		return sortedGenres[0] ?? "Unknown";
	}

	async saveRoomPlaylist(roomID: string, userID: string): Promise<void> {
		if (!(await this.dbUtils.userExists(userID))) {
			throw new HttpException("User does not exist", HttpStatus.NOT_FOUND);
		}
		if (!(await this.dbUtils.roomExists(roomID))) {
			throw new HttpException("Room does not exist", HttpStatus.NOT_FOUND);
		}
		const room: RoomDto = await this.getRoomInfo(roomID);
		const tokens: SpotifyTokenPair = await this.spotifyService.getSpotifyTokens(
			userID,
		);
		await this.spotifyService.saveRoomPlaylist(room, tokens);
	}

	async unsaveRoomPlaylist(roomID: string, userID: string): Promise<void> {
		if (!(await this.dbUtils.userExists(userID))) {
			throw new HttpException("User does not exist", HttpStatus.NOT_FOUND);
		}
		if (!(await this.dbUtils.roomExists(roomID))) {
			throw new HttpException("Room does not exist", HttpStatus.NOT_FOUND);
		}
		const room: RoomDto = await this.getRoomInfo(roomID);
		const tokens: SpotifyTokenPair = await this.spotifyService.getSpotifyTokens(
			userID,
		);
		await this.spotifyService.saveRoomPlaylist(room, tokens);
	}

	// async shareRoom(@Request() req: Request, @Param("roomID") roomID: string, @Body() users: string[]) {
	// 	const userInfo: JWTPayload = this.auth.getUserInfo(req);
	// 	return await this.roomsService.shareRoom(roomID, userInfo.id, users);
	// }
	/*
	async sendMessage(message: DirectMessageDto): Promise<DirectMessageDto> {
		//send message to user
		try {
			const newMessage = await this.prisma.message.create({
				data: {
					contents: message.messageBody,
					date_sent: message.dateSent,
					sender: message.sender.userID,
				},
			});
			const m: PrismaTypes.private_message =
				await this.prisma.private_message.create({
					data: {
						users: {
							connect: {
								user_id: message.recipient.userID,
							},
						},
						message: {
							connect: {
								message_id: newMessage.message_id,
							},
						},
					},
				});
			console.log("new DM: ");
			console.log(m);
			return await this.dtogen.generateDirectMessageDto(m.p_message_id);
		} catch (e) {
			throw new Error("Failed to send message");
		}
	}
	*/
	async shareRoom(
		roomID: string,
		userID: string,
		users: string[],
	): Promise<void> {
		if (users.length === 0) {
			throw new HttpException("User list is empty", HttpStatus.BAD_REQUEST);
		}
		await this.dbUtils.usersExist([userID, ...users]).then((users) => {
			users.forEach((user) => {
				if (!user.exists) {
					throw new HttpException(
						`User (with id '${user.userID}') does not exist`,
						HttpStatus.NOT_FOUND,
					);
				}
			});
		});
		if (!(await this.dbUtils.roomExists(roomID))) {
			throw new HttpException("Room does not exist", HttpStatus.NOT_FOUND);
		}
		const room: RoomDto = await this.getRoomInfo(roomID);
		const roomShares: ({
			private_message: {
				p_message_id: string;
				recipient: string;
			} | null;
		} & {
			message_id: string;
			contents: string;
			date_sent: Date;
			sender: string;
		})[] = await this.prisma.$transaction(
			users.map((user) => {
				return this.prisma.message.create({
					data: {
						contents: `##${room.roomID}##`,
						date_sent: new Date(),
						users: {
							connect: {
								user_id: userID, // sender
							},
						},
						private_message: {
							create: {
								users: {
									connect: {
										user_id: user, // recipient
									},
								},
							},
						},
					},
					include: {
						private_message: true,
					},
				});
			}),
		);
		if (this.server) {
			const roomShareMessages: ({
				message: {
					message_id: string;
					contents: string;
					date_sent: Date;
					sender: string;
				};
			} & {
				p_message_id: string;
				recipient: string;
			})[] = [];
			for (const rs of roomShares) {
				if (rs.private_message !== null) {
					roomShareMessages.push({
						message: {
							message_id: rs.message_id,
							contents: rs.contents,
							date_sent: rs.date_sent,
							sender: rs.sender,
						},
						p_message_id: rs.private_message.p_message_id,
						recipient: rs.private_message.recipient,
					});
				}
			}
			const roomShareDMs: DirectMessageDto[] =
				await this.dtogen.generateMultipleDirectMessageDto(roomShareMessages);
			this.dmUsersService.shareRoom(this.server, roomShareDMs);
		}
		throw new HttpException(`Room shared`, HttpStatus.CREATED);
	}
}
