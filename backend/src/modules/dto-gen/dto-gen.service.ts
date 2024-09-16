import { Injectable } from "@nestjs/common";
import { RoomDto } from "../rooms/dto/room.dto";
import { UserDto } from "../users/dto/user.dto";
import { PrismaService } from "../../../prisma/prisma.service";
//import { Prisma } from "@prisma/client";
import * as PrismaTypes from "@prisma/client";
import { DbUtilsService } from "../db-utils/db-utils.service";
import { LiveChatMessageDto } from "../../live/dto/livechatmessage.dto";
import { DirectMessageDto } from "../users/dto/dm.dto";

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
		if (!(await this.dbUtils.userExists(userID))) {
			throw new Error("User with id " + userID + " does not exist");
		}

		//check if userID exists
		const user: PrismaTypes.users | null = await this.prisma.users.findUnique({
			where: { user_id: userID },
		});

		if (!user || user === null) {
			throw new Error(
				"An unexpected error occurred in the database while fetching user. DTOGenService.generateUserDto():ERROR01",
			);
		}

		//get user info
		const result: UserDto = this.generateBriefUserDto(user);
		result.links = await this.dbUtils.getLinks(user);
		// const preferences = await this.dbUtils.getPreferences(user);
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

		// result.fav_songs = preferences.fav_songs;

		if (fully_qualify) {
			const recent_rooms = await this.dbUtils.getActivity(user);
			result.recent_rooms = {
				count: recent_rooms.count,
				data: recent_rooms.data || [], // I'm assuming that recent_rooms.data is an array of room IDs
			};

			const favRooms = await this.prisma.bookmark.findMany({
				where: { user_id: userID },
			});
			const favRoomIDs: string[] = favRooms.map((r) => r.room_id);

			const roomDtoArray: RoomDto[] | null = await this.generateMultipleRoomDto(
				favRoomIDs,
			);
			if (roomDtoArray && roomDtoArray !== null) {
				result.fav_rooms = {
					count: roomDtoArray.length,
					data: roomDtoArray.map((r) => r.roomID),
				};
			}
		}

		const following: PrismaTypes.users[] | null =
			await this.dbUtils.getUserFollowing(userID);
		result.following.count = following.length;
		if (fully_qualify) {
			for (let i = 0; i < following.length; i++) {
				const f = following[i];
				if (f && f !== null) {
					const u: UserDto = this.generateBriefUserDto(f);
					result.following.data.push(u);
				}
			}
		}

		const followers: PrismaTypes.users[] | null =
			await this.dbUtils.getUserFollowers(userID);
		result.followers.count = followers.length;
		if (fully_qualify) {
			for (let i = 0; i < followers.length; i++) {
				const f = followers[i];
				if (f && f !== null) {
					const u: UserDto = this.generateBriefUserDto(f);
					result.followers.data.push(u);
				}
			}
		}

		//exclude links temporarily
		//exclude current songs
		//exclude fav genres
		//exclude fav songs

		// if (fully_qualify) {
		// 	const favRooms: PrismaTypes.room[] | null =
		// 		await this.dbUtils.getRandomRooms(5);
		// 	if (favRooms && favRooms !== null) {
		// 		result.fav_rooms.count = favRooms.length;
		// 		const ids: string[] = favRooms.map((r) => r.room_id);
		// 		const rooms = await this.generateMultipleRoomDto(ids);
		// 		if (rooms && rooms !== null) {
		// 			result.fav_rooms.data = rooms;
		// 		}
		// 	}
		// }

		// if (fully_qualify) {
		// 	const recentRooms: PrismaTypes.room[] | null =
		// 		await this.dbUtils.getRandomRooms(5);
		// 	if (recentRooms && recentRooms !== null) {
		// 		result.recent_rooms.count = recentRooms.length;
		// 		const ids: string[] = recentRooms.map((r) => r.room_id);
		// 		const rooms = await this.generateMultipleRoomDto(ids);
		// 		if (rooms && rooms !== null) {
		// 			result.recent_rooms.data = rooms;
		// 		}
		// 	}
		// }

		try {
			const currentRoomID = await this.dbUtils.getCurrentRoomID(userID);
			result.current_room_id = currentRoomID;
		} catch {
			//error will be thrown if not applicable
		}
		return result;
	}

	async generateFriendUserDto(selfID: string, friendUsername: string) {
		const friend = await this.prisma.users.findFirst({
			where: { username: friendUsername },
		});

		if (!friend || friend === null) {
			throw new Error(
				"User with username " + friendUsername + " does not exist",
			);
		}
		const friendID = friend.user_id;
		const friendship = await this.prisma.friends.findFirst({
			where: {
				OR: [
					{ friend1: selfID, friend2: friendID },
					{ friend1: friendID, friend2: selfID },
				],
			},
		});

		if (!friendship || friendship === null) {
			throw new Error(
				"Friendship between " + selfID + " and " + friendID + " does not exist",
			);
		}
		const result: UserDto = this.generateBriefUserDto(friend);
		const base = `/users/${result.username}`;
		result.friendship = {
			status: !friendship.is_pending,
			accept_url: friendship.is_pending ? "" : base + "/accept",
			reject_url: friendship.is_pending ? "" : base + "/reject",
		};
		return result;
	}

	generateBriefUserDto(
		user: PrismaTypes.users,
		add_friendship = false,
	): UserDto {
		let result: UserDto = {
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
			current_song: {
				songID: "",
				title: "",
				artists: [],
				cover: "",
				spotify_id: "",
				duration: 0,
				start_time: new Date(),
			},
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
		};
		if (add_friendship) {
			result = {
				...result,
				friendship: {
					status: false,
					accept_url: "",
					reject_url: "",
				},
			};
		}
		return result;
	}

	async generateMultipleUserDto(
		user_ids: string[],
		fully_qualify = false,
	): Promise<UserDto[]> {
		const users: PrismaTypes.users[] | null = await this.prisma.users.findMany({
			where: { user_id: { in: user_ids } },
		});

		if (!users || users === null) {
			throw new Error(
				"An unexpected error occurred in the database. Could not fetch users. DTOGenService.generateMultipleUserDto():ERROR01",
			);
		}

		//const result: UserDto[] = [];
		const promises: Promise<UserDto>[] = [];
		for (let i = 0; i < users.length; i++) {
			const u = users[i];
			if (u && u !== null) {
				/*
				const user: UserDto = await this.generateUserDto(u.user_id, false);
				result.push(user);
				*/
				promises.push(this.generateUserDto(u.user_id, fully_qualify));
			}
		}
		const result: UserDto[] = await Promise.all(promises);
		return result;
	}

	async generateRoomDto(roomID: string): Promise<RoomDto | null> {
		const room: PrismaTypes.room | null = await this.prisma.room.findUnique({
			where: { room_id: roomID },
		});

		if (!room || room === null) {
			return null;
		}

		const scheduledRoom = await this.prisma.scheduled_room.findUnique({
			where: { room_id: roomID },
		});

		const result: RoomDto = {
			creator: new UserDto(),
			roomID: room.room_id,
			participant_count: 0,
			room_name: room.name,
			description: room.description || "",
			is_temporary: room.is_temporary || false,
			is_private: await this.dbUtils.isRoomPrivate(roomID),
			is_scheduled: false,
			start_date: new Date(),
			end_date: new Date(),
			language: room.room_language || "",
			has_explicit_content: room.explicit || false,
			has_nsfw_content: room.nsfw || false,
			room_image: room.playlist_photo || "",
			tags: room.tags || [],
			childrenRoomIDs: [],
		};

		if (scheduledRoom && scheduledRoom !== null) {
			result.is_scheduled = true;
			/*
			result.start_date = scheduledRoom.start_date;
			result.end_date = scheduledRoom.end_date;
			*/
		}

		const creator = await this.generateUserDto(room.room_creator, false);
		if (creator && creator !== null) {
			result.creator = creator;
		}

		//participant count will be added later
		//current song will be added later
		//dates will be added later
		//current songs will be added later

		return result;
	}

	async generateRoomDtoFromRoom(
		room: PrismaTypes.room,
	): Promise<RoomDto | null> {
		if (!room || room === null) {
			return null;
		}

		const scheduledRoom = await this.prisma.scheduled_room.findUnique({
			where: { room_id: room.room_id },
		});

		const result: RoomDto = {
			creator: new UserDto(),
			roomID: room.room_id,
			participant_count: 0,
			room_name: room.name,
			description: room.description || "",
			is_temporary: room.is_temporary || false,
			is_private: await this.dbUtils.isRoomPrivate(room.room_id),
			is_scheduled: false,
			start_date: new Date(),
			end_date: new Date(),
			language: room.room_language || "",
			has_explicit_content: room.explicit || false,
			has_nsfw_content: room.nsfw || false,
			room_image: room.playlist_photo || "",
			current_song: {
				songID: "",
				title: "",
				artists: [],
				cover: "",
				spotify_id: "",
				duration: 0,
				start_time: new Date(),
			},
			tags: room.tags || [],
			childrenRoomIDs: [],
		};

		const creator = await this.generateUserDto(room.room_creator, false);
		if (creator && creator !== null) {
			const creator = await this.generateUserDto(room.room_creator, false);
			if (creator && creator !== null) {
				result.creator = creator;
			}
		}

		if (scheduledRoom && scheduledRoom !== null) {
			result.is_scheduled = true;
			/*
			result.start_date = scheduledRoom.start_date;
			result.end_date = scheduledRoom.end_date;
			*/
		}

		//participant count will be added later
		//current song will be added later
		//dates will be added later
		//current songs will be added later

		return result;
	}

	async generateMultipleRoomDto(room_ids: string[]): Promise<RoomDto[]> {
		if (room_ids.length === 0) {
			return [];
		}
		const rooms: PrismaTypes.room[] | null = await this.prisma.room.findMany({
			where: { room_id: { in: room_ids } },
		});

		if (!rooms || rooms === null) {
			throw new Error("Unknown error. DB returned null");
		}

		const userIds: string[] = rooms.map((r) => r.room_creator);
		//remove duplicate user ids
		const uniqueUserIds: string[] = [...new Set(userIds)];
		const users: PrismaTypes.users[] | null = await this.prisma.users.findMany({
			where: { user_id: { in: uniqueUserIds } },
		});

		const userDtos: UserDto[] = [];
		for (let i = 0; i < users.length; i++) {
			const u = users[i];
			if (u && u !== null) {
				const user = this.generateBriefUserDto(u);
				userDtos.push(user);
			}
		}

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
				const room: RoomDto = {
					creator: u || new UserDto(),
					roomID: r.room_id,
					participant_count: 0, //to fix soon
					room_name: r.name,
					description: r.description || "",
					is_temporary: r.is_temporary || false,
					is_private: false, //db must add column
					is_scheduled: false, //db must add column
					start_date: new Date(),
					end_date: new Date(),
					language: r.room_language || "",
					has_explicit_content: r.explicit || false,
					has_nsfw_content: r.nsfw || false,
					room_image: r.playlist_photo || "",
					tags: r.tags || [],
					childrenRoomIDs: [],
				};
				result.push(room);
			}
		}
		return result;
	}

	async generateLiveChatMessageDto(
		messageID: string,
	): Promise<LiveChatMessageDto> {
		const roomMessage: PrismaTypes.room_message | null =
			await this.prisma.room_message.findUnique({
				where: { message_id: messageID },
			});

		if (!roomMessage || roomMessage === null) {
			throw new Error(
				"Message with id " +
					messageID +
					" does not exist. DTOGenService.generateLiveChatMessageDto():ERROR01",
			);
		}

		const message: PrismaTypes.message | null =
			await this.prisma.message.findUnique({
				where: { message_id: messageID },
			});

		if (!message || message === null) {
			throw new Error(
				"Message with id " +
					messageID +
					" does not exist. DTOGenService.generateLiveChatMessageDto():ERROR02",
			);
		}

		const sender: UserDto = await this.generateUserDto(message.sender);

		const result: LiveChatMessageDto = {
			messageBody: message.contents,
			sender: sender,
			roomID: roomMessage.room_id,
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

		if (!dms || dms === null) {
			throw new Error(
				"An unexpected error occurred in the database. Could not fetch direct messages. DTOGenService.generateMultipleDirectMessageDto():ERROR01",
			);
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

				const message: DirectMessageDto = {
					index: i,
					messageBody: dm.message.contents,
					sender: sender,
					recipient: recipient,
					dateSent: dm.message.date_sent,
					dateRead: new Date(0),
					isRead: false,
					pID: dm.p_message_id,
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
				};
				result.push(message);
			}
		}
		return result;
	}
}
