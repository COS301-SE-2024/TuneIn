import { Injectable } from "@nestjs/common";
import { UserProfileDto } from "../profile/dto/userprofile.dto";
import { RoomDto } from "../rooms/dto/room.dto";
import { UserDto } from "../users/dto/user.dto";
import { PrismaService } from "../../../prisma/prisma.service";
import * as Prisma from "@prisma/client";
import { DbUtilsService } from "../db-utils/db-utils.service";
import { LiveChatMessageDto } from "src/chat/dto/livechatmessage.dto";

/*
## UserProfileDto (User Profile Info)
A object representing User Profile information.
```json
{
	profile_name : string,
	userID : string,
	username : string,
	profile_picture_url : string,
	followers: {
		count: int,
		data: [ProfileDto]
	},
	following: {
		count: int,
		data: [ProfileDto]
	},
	links: {
		count: int,
		data: [string]
	},
	bio : string,
	current_song: SongInfoDto,
	fav_genres: {
		count: int,
		data: [string]
	},
	fav_songs: {
		count: int,
		data: [SongInfoDto]
	},
	fav_rooms: {
		count: int,
		data: [RoomDto]
	},
	recent_rooms: {
		count: int,
		data: [RoomDto]
	}
}
```

## RoomDto (Room Info)
A object representing Room information.
```json
{
	creator: ProfileDto,
	roomID: string,
	partipicant_count: number,
	room_name: string,
	description: string,
	is_temporary: boolean,
	is_private: boolean,
	is_scheduled: boolean,
	start_date: DateTime,
	end_date: DateTime,
	language: string,
	has_explicit_content: boolean,
	has_nsfw_content: boolean,
	room_image: string,
	current_song: SongInfoDto,
	tags: [string]
}
```

## SongInfoDto (Song Info)
A object representing Song information.
```json
{
	title: string,
	artists: [string],
	cover: string,
	start_time: DateTime
}
```
*/
// A service that will generate DTOs
@Injectable()
export class DtoGenService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly dbUtils: DbUtilsService,
	) {}

	async generateUserProfileDto(
		userID: string,
		fully_qualify: boolean = true,
	): Promise<UserProfileDto> {
		if (!(await this.dbUtils.userExists(userID))) {
			throw new Error("User with id " + userID + " does not exist");
		}

		//check if userID exists
		const user: Prisma.users | null = await this.prisma.users.findUnique({
			where: { user_id: userID },
		});

		if (!user || user === null) {
			throw new Error(
				"An unexpected error occurred in the database while fetching user. DTOGenService.generateUserProfileDto():ERROR01",
			);
		}

		//get user info
		const result: UserProfileDto = this.generateBriefUserProfileDto(user);
		result.links = await this.dbUtils.getLinks(user);
    const preferences = await this.dbUtils.getPreferences(user);
    result.fav_genres = preferences.fav_genres;
    result.fav_songs = preferences.fav_songs;
    const recent_rooms = await this.dbUtils.getActivity(user);
    result.recent_rooms = {
      count: recent_rooms.count,
      data: (await this.generateMultipleRoomDto(recent_rooms.data)) || [],
    };

    const favRooms = await this.prisma.bookmark.findMany({
      where: { user_id: userID },
    });

    const roomDtoArray: RoomDto[] = [];

    // Iterate through each room_id and generate RoomDto
    for (const room of favRooms) {
      const roomDto = await this.generateRoomDto(room.room_id);
      if (roomDto) {
        roomDtoArray.push(roomDto);
      }
    }

    result.fav_rooms = {
      count: roomDtoArray.length,
      data: roomDtoArray,
    };

		const following: Prisma.users[] | null =
			await this.dbUtils.getUserFollowing(userID);
		if (following && following !== null) {
			result.following.count = following.length;
			if (fully_qualify) {
				for (let i = 0; i < following.length; i++) {
					const f = following[i];
					if (f && f !== null) {
						const u: UserProfileDto = this.generateBriefUserProfileDto(f);
						result.following.data.push(u);
					}
				}
			}
		}

		const followers: Prisma.users[] | null =
			await this.dbUtils.getUserFollowers(userID);
		if (followers && followers !== null) {
			result.followers.count = followers.length;
			if (fully_qualify) {
				for (let i = 0; i < followers.length; i++) {
					const f = followers[i];
					if (f && f !== null) {
						const u: UserProfileDto = this.generateBriefUserProfileDto(f);
						result.followers.data.push(u);
					}
				}
			}
		}

		//exclude links temporarily
		//exclude current songs
		//exclude fav genres
		//exclude fav songs

		// if (fully_qualify) {
		// 	const favRooms: Prisma.room[] | null =
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
		// 	const recentRooms: Prisma.room[] | null =
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

		return result;
	}

	generateBriefUserProfileDto(user: Prisma.users): UserProfileDto {
		const result: UserProfileDto = {
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
				data: [],
			},
			bio: user.bio || "",
			current_song: {
				title: "",
				artists: [],
				cover: "",
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
		return result;
	}

	async generateMultipleUserProfileDto(
		user_ids: string[],
	): Promise<UserProfileDto[]> {
		const users: Prisma.users[] | null = await this.prisma.users.findMany({
			where: { user_id: { in: user_ids } },
		});

		if (!users || users === null) {
			throw new Error(
				"An unexpected error occurred in the database. Could not fetch users. DTOGenService.generateMultipleUserProfileDto():ERROR01",
			);
		}

		const result: UserProfileDto[] = [];
		for (let i = 0; i < users.length; i++) {
			const u = users[i];
			if (u && u !== null) {
				const user: UserProfileDto = await this.generateUserProfileDto(
					u.user_id,
					false,
				);
				result.push(user);
			}
		}
		return result;
	}

	async generateRoomDto(roomID: string): Promise<RoomDto | null> {
		const room: Prisma.room | null = await this.prisma.room.findUnique({
			where: { room_id: roomID },
		});

		if (!room || room === null) {
			return null;
		}

		const scheduledRoom = await this.prisma.scheduled_room.findUnique({
			where: { room_id: roomID },
		});

		const result: RoomDto = {
			creator: new UserProfileDto(),
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
			current_song: {
				title: "",
				artists: [],
				cover: "",
				start_time: new Date(),
			},
			tags: room.tags || [],
		};

		if (scheduledRoom && scheduledRoom !== null) {
			result.is_scheduled = true;
			/*
			result.start_date = scheduledRoom.start_date;
			result.end_date = scheduledRoom.end_date;
			*/
		}

		const creator = await this.generateUserProfileDto(room.room_creator, false);
		if (creator && creator !== null) {
			result.creator = creator;
		}

		//participant count will be added later
		//current song will be added later
		//dates will be added later
		//current songs will be added later

		return result;
	}

	async generateRoomDtoFromRoom(room: Prisma.room): Promise<RoomDto | null> {
		if (!room || room === null) {
			return null;
		}

		const scheduledRoom = await this.prisma.scheduled_room.findUnique({
			where: { room_id: room.room_id },
		});

		const result: RoomDto = {
			creator: new UserProfileDto(),
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
				title: "",
				artists: [],
				cover: "",
				start_time: new Date(),
			},
			tags: room.tags || [],
		};

		const creator = await this.generateUserProfileDto(room.room_creator, false);
		if (creator && creator !== null) {
			result.creator = creator;
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

	async generateMultipleRoomDto(room_ids: string[]): Promise<RoomDto[] | null> {
		const rooms: Prisma.room[] | null = await this.prisma.room.findMany({
			where: { room_id: { in: room_ids } },
		});

		if (!rooms || rooms === null) {
			return null;
		}

		const userIds: string[] = rooms.map((r) => r.room_creator);
		//remove duplicate user ids
		const uniqueUserIds: string[] = [...new Set(userIds)];
		const users: Prisma.users[] | null = await this.prisma.users.findMany({
			where: { user_id: { in: uniqueUserIds } },
		});

		const userProfiles: UserProfileDto[] = [];
		for (let i = 0; i < users.length; i++) {
			const u = users[i];
			if (u && u !== null) {
				const user = this.generateBriefUserProfileDto(u);
				userProfiles.push(user);
			}
		}

		const result: RoomDto[] = [];
		for (let i = 0; i < rooms.length; i++) {
			const r = rooms[i];
			if (r && r !== null) {
				const u = userProfiles.find((u) => u.userID === r.room_creator);
				if (!u || u === null) {
					throw new Error(
						"Weird error. Got users from Rooms table but user (" +
							r.room_creator +
							") not found in Users table",
					);
				}
				const room: RoomDto = {
					creator: u || new UserProfileDto(),
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
					current_song: {
						title: "",
						artists: [],
						cover: "",
						start_time: new Date(),
					},
					tags: r.tags || [],
				};
				result.push(room);
			}
		}
		return result;
	}

	async generateUserDto(): Promise<UserDto | null> {
		return new UserDto();
	}

	async generateLiveChatMessageDto(
		messageID: string,
	): Promise<LiveChatMessageDto> {
		const roomMessage: Prisma.room_message | null =
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

		const message: Prisma.message | null = await this.prisma.message.findUnique(
			{
				where: { message_id: messageID },
			},
		);

		if (!message || message === null) {
			throw new Error(
				"Message with id " +
					messageID +
					" does not exist. DTOGenService.generateLiveChatMessageDto():ERROR02",
			);
		}

		const sender: UserProfileDto = await this.generateUserProfileDto(
			message.sender,
		);

		const result: LiveChatMessageDto = {
			messageBody: message.contents,
			sender: sender,
			roomID: roomMessage.room_id,
			dateCreated: message.date_sent,
		};

		return result;
	}

	async generateMultipleLiveChatMessageDto(
		messages: Prisma.message[],
	): Promise<LiveChatMessageDto[]> {
		const senderIDs: string[] = messages.map((m) => m.sender);
		const uniqueSenderIDs: string[] = [...new Set(senderIDs)];
		const senders: Map<string, UserProfileDto> = new Map<
			string,
			UserProfileDto
		>();
		for (let i = 0; i < uniqueSenderIDs.length; i++) {
			const sender: UserProfileDto = await this.generateUserProfileDto(
				uniqueSenderIDs[i],
			);
			senders.set(uniqueSenderIDs[i], sender);
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
				const s: UserProfileDto | undefined = senders.get(m.sender);
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
}
