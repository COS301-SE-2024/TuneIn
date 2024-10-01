import { Injectable } from "@nestjs/common";
import { RoomDto } from "../rooms/dto/room.dto";
import { UserDto } from "../users/dto/user.dto";
import { PrismaService } from "../../../prisma/prisma.service";
//import { Prisma } from "@prisma/client";
import * as PrismaTypes from "@prisma/client";
import {
	DbUtilsService,
	FullyQualifiedRoom,
	UserWithAuth,
} from "../db-utils/db-utils.service";
import { LiveChatMessageDto } from "../../live/dto/livechatmessage.dto";
import { DirectMessageDto } from "../users/dto/dm.dto";
import validator from "validator";

// A service that will generate DTOs
@Injectable()
export class DtoGenService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly dbUtils: DbUtilsService,
	) {}

	async generateUserDto(
		userID: string,
		fully_qualify = true,
	): Promise<UserDto> {
		//check if userID exists
		const users: UserWithAuth[] = await this.dbUtils.getUsersWithAuth([userID]);

		if (users.length === 0) {
			throw new Error("User with id " + userID + " does not exist");
		}
		const user: UserWithAuth = users[0];

		//get user info
		const result: UserDto = await this.generateBriefUserDto(user);
		result.links = await this.dbUtils.getLinks(user);
		const fav_genres = await this.prisma.favorite_genres.findMany({
			where: { user_id: userID },
			include: { genre: true },
		});

		const fav_songs = await this.prisma.favorite_songs.findMany({
			where: { user_id: userID },
			include: { song: true },
		});

		result.fav_genres = {
			count: fav_genres.length,
			data: fav_genres
				.map((genre) => genre.genre?.genre)
				.filter((name): name is string => name !== null),
		};

		result.fav_songs = {
			count: fav_songs.length,
			data: fav_songs.map((song) => ({
				songID: song.song.song_id,
				title: song.song.name,
				artists: song.song.artists,
				cover: song.song.artwork_url as string,
				spotify_id: song.song.spotify_id,
				duration: song.song.duration as number,
			})),
		};
		result.hasSpotifyAccount = await this.prisma.authentication
			.findFirst({
				where: { user_id: userID },
			})
			.then((query) => {
				return query !== null;
			});

		if (fully_qualify) {
			const recent_rooms = await this.dbUtils.getActivity(user);
			result.recent_rooms = {
				count: recent_rooms.count,
				data: recent_rooms.data,
			};

			const bookmarkedRooms = await this.prisma.room.findMany({
				where: {
					bookmark: {
						some: {
							user_id: userID,
						},
					},
				},
			});
			result.fav_rooms = {
				count: bookmarkedRooms.length,
				data: bookmarkedRooms.map((r) => r.room_id),
			};
		}

		if (fully_qualify) {
			const followData: {
				following: UserWithAuth[];
				followers: UserWithAuth[];
			} = await this.dbUtils.getUserFollowersAndFollowing(userID);

			for (let i = 0; i < followData.following.length; i++) {
				const f = followData.following[i];
				const u: UserDto = await this.generateBriefUserDto(f);
				result.following.data.push(u);
			}
			result.following.count = followData.following.length;

			for (let i = 0; i < followData.followers.length; i++) {
				const f = followData.followers[i];
				const u: UserDto = await this.generateBriefUserDto(f);
				result.followers.data.push(u);
			}
			result.followers.count = followData.followers.length;
		} else {
			const followData: {
				following: number;
				followers: number;
			} = await this.dbUtils.getUserFollowersAndFollowingCount(user.user_id);

			result.following.count = followData.following;
			result.followers.count = followData.followers;
		}

		const currentRoom: PrismaTypes.room[] = await this.prisma.room.findMany({
			where: {
				participate: {
					some: {
						user_id: userID,
					},
				},
			},
		});
		if (currentRoom.length > 0) {
			result.current_room_id = currentRoom[0].room_id;
		}
		return result;
	}

	generateBriefUserDto(user: UserWithAuth): UserDto {
		return {
			profile_name: user.full_name || "",
			userID: user.user_id,
			username: user.username,
			profile_picture_url: user.profile_picture || "",
			followers: {
				count: 0,
				data: [],
			},
			following: {
				count: 0,
				data: [],
			},
			links: {
				count: 0,
				data: {},
			},
			bio: user.bio || "",
			fav_genres: {
				count: 0,
				data: [],
			},
			fav_songs: {
				count: 0,
				data: [],
			},
			fav_rooms: {
				count: 0,
				data: [],
			},
			recent_rooms: {
				count: 0,
				data: [],
			},
			hasSpotifyAccount: user.authentication !== null,
		};
	}

	async generateMultipleUserDto(
		user_ids: string[],
		fully_qualify = false,
	): Promise<UserDto[]> {
		const users: PrismaTypes.users[] = await this.prisma.users.findMany({
			where: { user_id: { in: user_ids } },
		});

		const promises: Promise<UserDto>[] = [];
		for (let i = 0; i < users.length; i++) {
			const u = users[i];
			if (u && u !== null) {
				promises.push(this.generateUserDto(u.user_id, fully_qualify));
			}
		}
		const result: UserDto[] = await Promise.all(promises);
		return result;
	}

	async generateMultipleRoomDto(roomIDs: string[]): Promise<RoomDto[]> {
		if (roomIDs.length === 0) {
			return [];
		}
		const rooms: FullyQualifiedRoom[] =
			await this.dbUtils.getFullyQualifiedRooms(roomIDs);
		const userIDs: string[] = rooms.map((r) => r.room_creator);
		const users: UserWithAuth[] = await this.dbUtils.getUsersWithAuth(userIDs);
		const userDtos: UserDto[] = users.map((u) => this.generateBriefUserDto(u));

		const result: RoomDto[] = [];
		for (let i = 0; i < rooms.length; i++) {
			const r = rooms[i];
			const u = userDtos.find((u) => u.userID === r.room_creator);
			if (!u) {
				throw new Error(
					"Weird error. Got users from Rooms table but user (" +
						r.room_creator +
						") not found in Users table",
				);
			}
			const childrenRooms = r.child_room_child_room_parent_room_idToroom;
			const room: RoomDto = {
				creator: u || new UserDto(),
				roomID: r.room_id,
				spotifyPlaylistID: r.playlist_id || "",
				participant_count: r.participate.length,
				room_name: r.name,
				description: r.description || "",
				is_temporary: r.is_temporary || false,
				is_private: r.private_room !== null,
				is_scheduled: r.scheduled_room !== null,
				start_date: new Date(),
				end_date: new Date(),
				language: r.room_language || "",
				has_explicit_content: r.explicit || false,
				has_nsfw_content: r.nsfw || false,
				room_image: r.playlist_photo || "",
				tags: r.tags || [],
				childrenRoomIDs: childrenRooms.map((r) => r.room_id),
			};
			result.push(room);
		}
		return result;
	}

	async generateMultipleRoomDtoFromRoom(
		rooms: FullyQualifiedRoom[],
	): Promise<RoomDto[]> {
		if (rooms.length === 0) {
			return [];
		}
		const userIDs: string[] = rooms.map((r) => r.room_creator);
		const users: UserWithAuth[] = await this.dbUtils.getUsersWithAuth(userIDs);
		const userDtos: UserDto[] = users.map((u) => this.generateBriefUserDto(u));

		const result: RoomDto[] = [];
		for (let i = 0; i < rooms.length; i++) {
			const r = rooms[i];
			if (r && r !== null) {
				const u = userDtos.find((u) => u.userID === r.room_creator);
				if (!u || u === null) {
					throw new Error(
						"Weird error. Got users from Rooms table but user (" +
							r.room_creator +
							") not found in Users table",
					);
				}
				const childrenRooms = r.child_room_child_room_parent_room_idToroom;
				const room: RoomDto = {
					creator: u || new UserDto(),
					roomID: r.room_id,
					spotifyPlaylistID: r.playlist_id || "",
					participant_count: r.participate.length,
					room_name: r.name,
					description: r.description || "",
					is_temporary: r.is_temporary || false,
					is_private: r.private_room !== null,
					is_scheduled: r.scheduled_room !== null,
					start_date: new Date(),
					end_date: new Date(),
					language: r.room_language || "",
					has_explicit_content: r.explicit || false,
					has_nsfw_content: r.nsfw || false,
					room_image: r.playlist_photo || "",
					tags: r.tags || [],
					childrenRoomIDs: childrenRooms.map((r) => r.room_id),
				};
				result.push(room);
			}
		}
		return result;
	}

	async generateLiveChatMessageDto(
		messageID: string,
	): Promise<LiveChatMessageDto> {
		const message:
			| ({
					room_message: PrismaTypes.room_message | null;
			  } & PrismaTypes.message)
			| null = await this.prisma.message.findUnique({
			where: { message_id: messageID },
			include: { room_message: true },
		});

		if (message === null || message.room_message === null) {
			throw new Error(
				"Message with id " +
					messageID +
					" does not exist. DTOGenService.generateLiveChatMessageDto():ERROR01",
			);
		}

		const sender: UserDto = await this.generateUserDto(message.sender);

		const result: LiveChatMessageDto = {
			messageID: messageID,
			messageBody: message.contents,
			sender: sender,
			roomID: message.room_message.room_id,
			dateCreated: message.date_sent,
		};

		return result;
	}

	async generateMultipleLiveChatMessageDto(
		messages: PrismaTypes.message[],
	): Promise<LiveChatMessageDto[]> {
		const senderIDs: string[] = messages.map((m) => m.sender);
		const uniqueSenderIDs: string[] = [...new Set(senderIDs)];
		const senders: Map<string, UserDto> = new Map<string, UserDto>();
		for (let i = 0; i < uniqueSenderIDs.length; i++) {
			const id = uniqueSenderIDs[i];
			if (id) {
				const sender: UserDto = await this.generateUserDto(id);
				senders.set(id, sender);
			}
		}

		const roomIDs = await this.prisma.room_message.findMany({
			where: {
				message_id: {
					in: messages.map((m) => m.message_id),
				},
			},
		});

		if (!roomIDs || roomIDs === null) {
			throw new Error(
				"An unexpected error occurred in the database. Could not fetch room IDs. DTOGenService.generateMultipleLiveChatMessageDto():ERROR01",
			);
		}

		const result: LiveChatMessageDto[] = [];
		for (let i = 0; i < messages.length; i++) {
			const m = messages[i];
			if (m && m !== null) {
				const s: UserDto | undefined = senders.get(m.sender);
				if (!s || s === null) {
					throw new Error(
						"Weird error. Got messages from Messages table but user (" +
							m.sender +
							") not found in Users table",
					);
				}

				const roomMessage = roomIDs.find((r) => r.message_id === m.message_id);
				if (!roomMessage || roomMessage === null) {
					throw new Error(
						"Weird error. Got messages from Messages table but message (" +
							m.message_id +
							") not found in Room Messages table",
					);
				}

				const message: LiveChatMessageDto = {
					messageID: m.message_id,
					messageBody: m.contents,
					sender: s,
					roomID: roomMessage.room_id,
					dateCreated: m.date_sent,
				};
				result.push(message);
			}
		}
		return result;
	}

	async generateDirectMessageDto(pmID: string): Promise<DirectMessageDto> {
		const dm:
			| ({ message: PrismaTypes.message } & PrismaTypes.private_message)
			| null = await this.prisma.private_message.findUnique({
			where: {
				p_message_id: pmID,
			},
			include: {
				message: true,
			},
		});
		console.log("dm: " + JSON.stringify(dm));

		if (!dm || dm === null) {
			throw new Error(
				"Message with id " +
					pmID +
					" does not exist. DTOGenService.generateDirectMessageDto():ERROR01",
			);
		}

		const sender: UserDto = await this.generateUserDto(dm.message.sender);
		const recipient: UserDto = await this.generateUserDto(dm.recipient);
		const index: number = await this.dbUtils.getDMIndex(
			sender.userID,
			recipient.userID,
			pmID,
		);

		const result: DirectMessageDto = {
			index: index,
			messageBody: dm.message.contents,
			sender: sender,
			recipient: recipient,
			dateSent: dm.message.date_sent,
			dateRead: new Date(0),
			isRead: false,
			pID: dm.p_message_id,
			bodyIsRoomID: this.messageBodyIsRoomID(dm.message.contents),
		};
		console.log("result: " + JSON.stringify(result));
		return result;
	}

	async getChatAsDirectMessageDto(
		participant1: string,
		participant2: string,
		unreadOnly = false,
	): Promise<DirectMessageDto[]> {
		/*
		const user1: UserDto = await this.generateUserDto(participant1);
		const user2: UserDto = await this.generateUserDto(participant2);
		*/
		const { user1, user2 }: { user1: UserDto; user2: UserDto } =
			await this.generateMultipleUserDto([participant1, participant2]).then(
				(users) => {
					if (users.length !== 2) {
						throw new Error(
							"An unexpected error occurred in the database. Could not fetch users. DTOGenService.getChatAsDirectMessageDto():ERROR01",
						);
					}
					if (
						!users[0] ||
						users[0] === null ||
						!users[1] ||
						users[1] === null
					) {
						throw new Error(
							"An unexpected error occurred in the database. Could not fetch users. DTOGenService.getChatAsDirectMessageDto():ERROR02",
						);
					}
					if (
						users[0].userID === participant1 &&
						users[1].userID === participant2
					) {
						return { user1: users[0], user2: users[1] };
					} else if (
						users[0].userID === participant2 &&
						users[1].userID === participant1
					) {
						return { user1: users[1], user2: users[0] };
					} else {
						throw new Error(
							"An unexpected error occurred in the database. Could not fetch users. DTOGenService.getChatAsDirectMessageDto():ERROR03",
						);
					}
				},
			);

		const dms: ({
			message: PrismaTypes.message;
		} & PrismaTypes.private_message)[] =
			await this.prisma.private_message.findMany({
				where: {
					OR: [
						{
							AND: [
								{ message: { sender: user1.userID } },
								{ recipient: user2.userID },
							],
						},
						{
							AND: [
								{ message: { sender: user2.userID } },
								{ recipient: user1.userID },
							],
						},
					],
				},
				include: {
					message: true,
				},
			});
		console.log(
			" direct messages between " + user1.username + " and " + user2.username,
		);
		console.log(dms);

		if (dms.length === 0) {
			return [];
		}

		//filter unread messages
		if (unreadOnly) {
			//a future feature
		}

		//sort messages by date
		dms.sort((a, b) => {
			return a.message.date_sent.getTime() - b.message.date_sent.getTime();
		});

		const result: DirectMessageDto[] = [];
		for (let i = 0; i < dms.length; i++) {
			const dm = dms[i];
			if (dm && dm !== null) {
				const sender: UserDto =
					dm.message.sender === user1.userID ? user1 : user2;
				const recipient: UserDto =
					dm.recipient === user1.userID ? user1 : user2;

				//body is room id, if it is: ##uuidv4##
				// uuid v4 regex: /^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i
				const message: DirectMessageDto = {
					index: i,
					messageBody: dm.message.contents,
					sender: sender,
					recipient: recipient,
					dateSent: dm.message.date_sent,
					dateRead: new Date(0),
					isRead: false,
					pID: dm.p_message_id,
					bodyIsRoomID: this.messageBodyIsRoomID(dm.message.contents),
				};
				result.push(message);
			}
		}
		return result;
	}

	async generateMultipleDirectMessageDto(
		dms: ({
			message: PrismaTypes.message;
		} & PrismaTypes.private_message)[],
	): Promise<DirectMessageDto[]> {
		const result: DirectMessageDto[] = [];

		let uniqueUserIDs: string[] = [
			...new Set(dms.map((dm) => dm.message.sender)),
		];
		uniqueUserIDs = [
			...uniqueUserIDs,
			...new Set(dms.map((dm) => dm.recipient)),
		];
		const users: UserDto[] = await this.generateMultipleUserDto(uniqueUserIDs);

		for (let i = 0; i < dms.length; i++) {
			const dm = dms[i];
			if (dm && dm !== null) {
				const sender: UserDto | undefined = users.find(
					(u) => u.userID === dm.message.sender,
				);
				const recipient: UserDto | undefined = users.find(
					(u) => u.userID === dm.recipient,
				);
				if (!sender || sender === null || !recipient || recipient === null) {
					throw new Error(
						"Weird error. Got messages from DMs table but user not found in Users table",
					);
				}

				const message: DirectMessageDto = {
					index: i,
					messageBody: dm.message.contents,
					sender: sender,
					recipient: recipient,
					dateSent: dm.message.date_sent,
					dateRead: new Date(0),
					isRead: false,
					pID: dm.p_message_id,
					bodyIsRoomID: this.messageBodyIsRoomID(dm.message.contents),
				};
				result.push(message);
			}
		}
		return result;
	}

	messageBodyIsRoomID(messageBody: string): boolean {
		// format: ##uuidv4##
		const regexPattern = /^##(.+?)##$/;
		const match = messageBody.match(regexPattern);

		// if there's a match and the captured group (the content between ##) is a valid UUID, return true
		if (match && validator.isUUID(match[1])) {
			return true;
		}
		return false;
	}
}
