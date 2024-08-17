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
	subHours,
	addHours,
	isBefore,
	startOfHour,
	startOfDay,
} from "date-fns";
import {
	RoomAnalyticsQueueDto,
	RoomAnalyticsParticipationDto,
	RoomAnalyticsInteractionsDto,
	RoomAnalyticsVotesDto,
	RoomAnalyticsSongsDto,
	RoomAnalyticsContributorsDto,
	RoomAnalyticsDto,
	RoomAnalyticsKeyMetricsDto,
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
		console.log("Getting room info for room", roomID);
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

	async joinRoom(_room_id: string, user_id: string): Promise<boolean> {
		console.log("user", user_id, "joining room", _room_id);
		try {
			// Check if the user is already in the room
			const room = await this.prisma.participate.findFirst({
				where: {
					user_id: user_id,
				},
			});

			if (room !== null) {
				return false;
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
			return true;
		} catch (error) {
			console.error("Error joining room:", error);
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
			const user = await this.prisma.user_activity.findFirst({
				where: {
					room_id: room_id,
					user_id: user_id,
					room_leave_time: null,
				},
			});
			if (user === null) {
				return false;
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
			return true;
		} catch (error) {
			console.error("Error leaving room:", error);
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
			songInfoDto.cover = song.song.artwork_url!;
			songInfoDto.artists = song.song.artist.split(",");
			songInfoDto.start_time = song.start_time;
			songInfoDtos.push(songInfoDto);
		}
		return songInfoDtos;
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
		const roomQueueAnalytics: RoomAnalyticsQueueDto =
			new RoomAnalyticsQueueDto();
		const roomQueue: SongInfoDto[] = await this.getRoomQueue(roomID);
		roomQueueAnalytics.total_songs_queued = roomQueue.length;
		roomQueueAnalytics.total_queue_exports = 0; // TODO: Implement logic to get total queue exports
		return roomQueueAnalytics;
	}

	async getRoomJoinAnalytics(
		roomID: string,
	): Promise<RoomAnalyticsParticipationDto["joins"]> {
		let total_joins: number = 0;
		let unique_joins: number = 0;
		const joins: RoomAnalyticsParticipationDto["joins"] = {
			per_day: {
				total_joins: [],
				unique_joins: [],
			},
			all_time: {
				total_joins: 0,
				unique_joins: 0,
			},
		};
		console.log("Getting room join analytics for room", roomID);
		const userActivityPerDay: any = await this.prisma.$queryRaw`
			SELECT DATE_TRUNC('day', "room_join_time") AS day,
				COUNT("user_id") as count
			FROM "user_activity"
			WHERE room_id = ${roomID}::UUID
			GROUP BY day, room_id
			ORDER BY day ASC;
		`;
		const uniqueUserActivityPerDay: any = await this.prisma.$queryRaw`
			SELECT DATE_TRUNC('day', "room_join_time") AS day,
				COUNT(DISTINCT "user_id") as count
			FROM "user_activity"
			WHERE room_id = ${roomID}::UUID
			GROUP BY day, room_id
			ORDER BY day ASC;
		`;

		// get the room creation date
		const room: PrismaTypes.room | null = await this.prisma.room.findUnique({
			where: {
				room_id: roomID,
			},
		});
		const roomCreationDate: Date | null = room?.date_created ?? null;

		if (userActivityPerDay.length === 0) {
			return joins;
		}

		for (let i = 0; i < userActivityPerDay.length; i++) {
			userActivityPerDay[i].count = Number(userActivityPerDay[i].count);
			total_joins += userActivityPerDay[i].count;
		}
		for (let i = 0; i < uniqueUserActivityPerDay.length; i++) {
			uniqueUserActivityPerDay[i].count = Number(
				uniqueUserActivityPerDay[i].count,
			);
			unique_joins += uniqueUserActivityPerDay[i].count;
		}
		// fill in the missing days
		// get all the days from the first day the room was created until today if the room is not older than 7 days
		// if the room is older than 7 days, get all the days from 7 days ago until today
		const allDays: Date[] = [];
		const today: Date = new Date();
		const firstDay: Date = userActivityPerDay[0].day;
		let day: Date = roomCreationDate ?? firstDay;
		if (isBefore(day, subHours(today, 24 * 7))) {
			day = subHours(today, 24 * 7);
		}
		//floor the day to the nearest day
		day = startOfDay(day);
		// add the first day
		while (isBefore(day, today)) {
			console.log("adding day", day);
			allDays.push(day);
			day = addHours(day, 24);
		}
		// add the missing days
		for (const d of allDays) {
			const dayExists: boolean = userActivityPerDay.find(
				(u: any) => u.day === d,
			);
			if (!dayExists) {
				userActivityPerDay.push({ day: d, count: 0 });
			}
		}
		// add the missing days
		for (const d of allDays) {
			const dayExists: boolean = uniqueUserActivityPerDay.find(
				(u: any) => u.day === d,
			);
			if (!dayExists) {
				uniqueUserActivityPerDay.push({ day: d, count: 0 });
			}
		}
		// sort the arrays
		userActivityPerDay.sort((a: any, b: any) => a.day - b.day);
		uniqueUserActivityPerDay.sort((a: any, b: any) => a.day - b.day);
		joins.per_day = {
			total_joins: userActivityPerDay,
			unique_joins: uniqueUserActivityPerDay,
		};
		joins.all_time = {
			total_joins: total_joins,
			unique_joins: unique_joins,
		};

		return joins;
	}

	async getRoomSessionAnalytics(
		roomID: string,
	): Promise<RoomAnalyticsParticipationDto["session_data"]> {
		let avg_duration: number = 0,
			min_duration: number = 0,
			max_duration: number = 0;
		const sessionData: RoomAnalyticsParticipationDto["session_data"] = {
			all_time: {
				avg_duration: 0,
				min_duration: 0,
				max_duration: 0,
			},
			per_day: [],
		};
		const sessionDurations: any = await this.prisma.$queryRaw`
			SELECT DATE_TRUNC('day', room_join_time) AS day,
				AVG(EXTRACT(EPOCH FROM (room_leave_time - room_join_time))) AS avg_duration,
				MIN(EXTRACT(EPOCH FROM (room_leave_time - room_join_time))) AS min_duration,
				MAX(EXTRACT(EPOCH FROM (room_leave_time - room_join_time))) AS max_duration
			FROM "user_activity"
			WHERE room_id = ${roomID}::UUID
			GROUP BY day, room_id
			ORDER BY day ASC;
		`;

		if (sessionDurations.length === 0) {
			return sessionData;
		}
		// get the room creation date
		const room: PrismaTypes.room | null = await this.prisma.room.findUnique({
			where: {
				room_id: roomID,
			},
		});
		const roomCreationDate: Date | null = room?.date_created ?? null;

		// fill in the missing days
		const allDays: Date[] = [];
		const today: Date = new Date();
		const firstDay: Date = sessionDurations[0].day;
		let day: Date = roomCreationDate ?? firstDay;
		if (isBefore(day, subHours(today, 24 * 7))) {
			day = subHours(today, 24 * 7);
		}
		//floor the day to the nearest day
		day = startOfDay(day);
		while (isBefore(day, today)) {
			allDays.push(day);
			day = addHours(day, 24);
		}
		day = startOfDay(day);
		// add the missing days
		for (const d of allDays) {
			const dayExists: boolean = sessionDurations.find((u: any) => u.day === d);
			if (!dayExists) {
				sessionDurations.push({
					day: d,
					avg_duration: 0,
					min_duration: 0,
					max_duration: 0,
				});
			}
		}
		// sort the array
		sessionDurations.sort((a: any, b: any) => a.day - b.day);
		// find the all time min, max, and avg
		for (let i = 0; i < sessionDurations.length; i++) {
			const session = sessionDurations[i];
			session.avg_duration = Number(session.avg_duration);
			session.min_duration = Number(session.min_duration);
			session.max_duration = Number(session.max_duration);
			avg_duration += Number(session.avg_duration);
			min_duration = Math.min(min_duration, Number(session.min_duration));
			max_duration = Math.max(max_duration, Number(session.max_duration));
		}
		avg_duration = avg_duration / sessionDurations.length;
		sessionData.all_time.avg_duration = avg_duration;
		sessionData.all_time.min_duration = min_duration;
		sessionData.all_time.max_duration = max_duration;
		sessionData.per_day = sessionDurations;
		return sessionData;
	}
	async getHourlyParticipantAnalytics(
		roomID: string,
	): Promise<RoomAnalyticsParticipationDto["participants_per_hour"]> {
		const participantsPerHour: RoomAnalyticsParticipationDto["participants_per_hour"] =
			[];
		const today: Date = new Date();
		const yesterday: Date = subHours(today, 24);
		console.log("Today", today, "Yesterday", yesterday);
		const userActivityPerHour: any = await this.prisma.$queryRaw`
			SELECT DATE_TRUNC('hour', room_join_time) AS hour,
				COUNT("user_id") as count
			FROM "user_activity"
			WHERE room_id = ${roomID}::UUID
			AND room_join_time > ${yesterday}
			GROUP BY hour, room_id
			ORDER BY hour ASC;
		`;
		console.log(
			"Getting room hourly participant analytics for room",
			roomID,
			"and user activity",
			userActivityPerHour,
		);
		if (userActivityPerHour.length === 0) {
			return participantsPerHour;
		}

		// get the room creation date
		const room: PrismaTypes.room | null = await this.prisma.room.findUnique({
			where: {
				room_id: roomID,
			},
		});
		const roomCreationDate: Date | null = room?.date_created ?? null;

		const allHours: Date[] = [];
		let hour: Date = roomCreationDate ?? userActivityPerHour[0].hour;
		if (isBefore(hour, subHours(today, 24))) {
			hour = subHours(today, 24);
		}
		//floor the day to the nearest day
		hour = startOfHour(hour);

		while (isBefore(hour, today)) {
			allHours.push(hour);
			hour = addHours(hour, 1);
		}
		// add the missing hours
		for (const h of allHours) {
			const hourExists: boolean = userActivityPerHour.find(
				(u: any) => u.hour === h,
			);
			if (!hourExists) {
				userActivityPerHour.push({ hour: h, count: 0 });
			}
		}
		// sort the array
		userActivityPerHour.sort((a: any, b: any) => a.hour - b.hour);
		console.log("User activity per hour", userActivityPerHour);
		for (const hour of userActivityPerHour) {
			const pph = {
				count: 0,
				instance: new Date(),
			};
			pph.count = Number(hour.count);
			pph.instance = hour.hour;
			console.log("Adding", pph);
			participantsPerHour.push(pph);
		}
		return participantsPerHour;
	}

	async getRoomPreviews(roomID: string): Promise<number> {
		const previews: any = await this.prisma.room_previews.findMany({
			where: {
				room_id: roomID,
			},
		});
		return previews.length;
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

		const roomAnalyticsParticipation: RoomAnalyticsParticipationDto =
			new RoomAnalyticsParticipationDto();
		roomAnalyticsParticipation.joins = await this.getRoomJoinAnalytics(roomID);
		roomAnalyticsParticipation.session_data =
			await this.getRoomSessionAnalytics(roomID);
		roomAnalyticsParticipation.participants_per_hour =
			await this.getHourlyParticipantAnalytics(roomID);
		roomAnalyticsParticipation.room_previews =
			await this.getRoomPreviews(roomID);
		roomAnalyticsParticipation.return_visits =
			await this.getReturnVisitsAnalytics(
				roomID,
				roomAnalyticsParticipation.joins.all_time.total_joins,
			);
		return roomAnalyticsParticipation;
	}

	async getReturnVisitsAnalytics(
		roomID: string,
		totalVisits: number,
	): Promise<RoomAnalyticsParticipationDto["return_visits"]> {
		const returnVisits: RoomAnalyticsParticipationDto["return_visits"] = {
			expected_return_count: 0,
			probability_of_return: 0,
		};
		console.log("Getting room return visits analytics for room", roomID);
		const result: any = await this.prisma.$queryRaw`
		SELECT
			COUNT(user_id) as user_count,
			user_id
		FROM
			user_activity
		WHERE
			room_id = ${roomID}::UUID
		GROUP BY
			user_id
		HAVING
			COUNT(user_id) > 1;
		`;
		if (result.length === 0) {
			return returnVisits;
		}
		console.log("Return visits", result);
		const returnCount: number = result.length;
		const averageVisits: number =
			result
				.map((r: any) => Number(r.user_count))
				.reduce((a: number, b: number) => a + b, 0) / result.length;
		returnVisits.probability_of_return = returnCount / totalVisits;
		returnVisits.expected_return_count = averageVisits;
		return returnVisits;
	}

	async getMessageInteractionsAnalytics(
		roomID: string,
	): Promise<RoomAnalyticsInteractionsDto["messages"]> {
		console.log("Getting room analytics for room", roomID);
		const messages: RoomAnalyticsInteractionsDto["messages"] = {
			per_hour: [],
			total: 0,
		};
		const today: Date = new Date();
		const yesterday: Date = subHours(today, 24);
		console.log("Today", today, "Yesterday", yesterday);
		const room: PrismaTypes.room | null = await this.prisma.room.findUnique({
			where: {
				room_id: roomID,
			},
		});

		const roomCreationDate: Date | null = room?.date_created ?? null;
		const messageActivityPerHour: any = await this.prisma.$queryRaw`
			SELECT DATE_TRUNC('hour', date_sent) AS hour,
				COUNT(message.message_id) as count
			FROM "message"
			INNER JOIN room_message ON room_message.message_id = message.message_id
			WHERE room_id = ${roomID}::UUID
				AND date_sent > ${yesterday}
			GROUP BY hour, room_id
			ORDER BY hour ASC;
		`;
		console.log(
			"Getting room message interactions analytics for room",
			roomID,
			"and message activity",
			messageActivityPerHour,
		);

		// fill in the missing hours
		let allHours: Date[] = [];
		// from from the date the room was created, get all the hours until now if the room is not older than a day
		let hour: Date = roomCreationDate ?? new Date();
		console.log("Room creation date", roomCreationDate);
		if (isBefore(hour, yesterday)) {
			hour = yesterday;
		}
		console.log("Starting hour", hour);
		//floor the hour to the nearest hour
		hour = startOfHour(hour);

		// let hour: Date = messageActivityPerHour[0].hour ;
		while (isBefore(hour, today)) {
			allHours.push(hour);
			hour = addHours(hour, 1);
		}
		console.log("All hours", allHours.length);
		// remove the last element of the array
		allHours = allHours.slice(0, allHours.length - 1);
		// add the missing hours
		for (const h of allHours) {
			const hourExists: boolean = messageActivityPerHour.find(
				(u: any) => u.hour === h,
			);
			if (!hourExists) {
				messageActivityPerHour.push({ hour: h, count: 0 });
			}
		}
		// sort the array
		messageActivityPerHour.sort((a: any, b: any) => a.hour - b.hour);
		console.log("Message activity per hour", messageActivityPerHour);
		for (const hour of messageActivityPerHour) {
			const m = {
				count: 0,
				hour: new Date(),
			};
			m.count = Number(hour.count);
			m.hour = hour.hour;
			console.log("Adding", m);
			messages.per_hour.push(m);
		}
		messages.total = messages.per_hour
			.map((m) => m.count)
			.reduce((a, b) => a + b, 0);
		return messages;
	}

	async getNumberOfReactions(roomID: string): Promise<number> {
		const reactions: any = await this.prisma.chat_reactions.findMany({
			where: {
				room_id: roomID,
			},
		});
		console.log(
			"Getting number of reactions for room",
			roomID,
			"and reactions",
			reactions,
		);
		if (!reactions || reactions === null) {
			return 0;
		}
		return reactions.length;
	}

	async getNumberOfBookmarks(roomID: string): Promise<number> {
		const bookmarks: PrismaTypes.bookmark[] | null =
			await this.prisma.bookmark.findMany({
				where: {
					room_id: roomID,
				},
			});
		if (!bookmarks || bookmarks === null) {
			return 0;
		}
		return bookmarks.length;
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

		const roomInteractionAnalytics: RoomAnalyticsInteractionsDto =
			new RoomAnalyticsInteractionsDto();
		roomInteractionAnalytics.messages =
			await this.getMessageInteractionsAnalytics(roomID);
		roomInteractionAnalytics.bookmarked_count =
			await this.getNumberOfBookmarks(roomID);
		roomInteractionAnalytics.reactions_sent =
			await this.getNumberOfReactions(roomID);
		return roomInteractionAnalytics;
	}

	async getTotalVotes(roomID: string): Promise<any> {
		const votes: any = await this.prisma.$queryRaw`
			select
				count(*) as count,
				room_id,
				is_upvote,
				queue.room_id
			from
				vote
			inner join queue on queue.queue_id = vote.queue_id
			group by
				is_upvote,
				room_id
			having
				room_id = ${roomID}::UUID;

		`;
		console.log("Getting total votes for room", roomID, "and votes", votes);
		const numOfUpvotes: number = Number(
			votes.filter((v: any) => v.is_upvote)[0].count,
		);
		const numOfDownvotes: number = Number(
			votes.filter((v: any) => !v.is_upvote)[0].count,
		);
		return {
			upvotes: numOfUpvotes,
			downvotes: numOfDownvotes,
		};
	}

	async getPercentageChangeInVotes(roomID: string): Promise<any> {
		// get total votes from today and yesterday
		const today: Date = new Date();
		const yesterday: Date = subHours(today, 24);
		const votesToday: any = await this.prisma.$queryRaw`
			select
				count(*) as count,
				room_id,
				is_upvote,
				queue.room_id
			from
				vote
			inner join queue on queue.queue_id = vote.queue_id
			where
				vote_time > ${yesterday}
			group by
				is_upvote,
				room_id
			having
				room_id = ${roomID}::UUID;
		`;
		const votesYesterday: any = await this.prisma.$queryRaw`
			select
				count(*) as count,
				room_id,
				is_upvote,
				queue.room_id
			from
				vote
			inner join queue on queue.queue_id = vote.queue_id
			where
				vote_time < ${yesterday}
			group by
				is_upvote,
				room_id
			having
				room_id = ${roomID}::UUID;
		`;
		if (votesToday.length === 0 || votesYesterday.length === 0) {
			return {
				daily_percentage_change_in_upvotes: 0,
				daily_percentage_change_in_downvotes: 0,
			};
		}
		console.log(
			"Getting percentage change in votes for room",
			roomID,
			"and votes",
			votesToday,
			votesYesterday,
		);
		const numOfUpvotesToday: number = Number(
			votesToday.filter((v: any) => v.is_upvote)[0].count,
		);
		const numOfDownvotesToday: number = Number(
			votesToday.filter((v: any) => !v.is_upvote)[0].count,
		);
		const numOfUpvotesYesterday: number = Number(
			votesYesterday.filter((v: any) => v.is_upvote)[0].count,
		);
		const numOfDownvotesYesterday: number = Number(
			votesYesterday.filter((v: any) => !v.is_upvote)[0].count,
		);
		const upvoteChange: number = numOfUpvotesToday - numOfUpvotesYesterday;
		const downvoteChange: number =
			numOfDownvotesToday - numOfDownvotesYesterday;
		const upvotePercentageChange: number =
			(upvoteChange / numOfUpvotesYesterday) * 100;
		const downvotePercentageChange: number =
			(downvoteChange / numOfDownvotesYesterday) * 100;
		return {
			daily_percentage_change_in_upvotes: upvotePercentageChange,
			daily_percentage_change_in_downvotes: downvotePercentageChange,
		};
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
		const roomVotesAnalytics: RoomAnalyticsVotesDto =
			new RoomAnalyticsVotesDto();
		const votes: any = await this.getTotalVotes(roomID);
		roomVotesAnalytics.total_upvotes = votes.upvotes;
		roomVotesAnalytics.total_downvotes = votes.downvotes;
		const percentageChange: any = await this.getPercentageChangeInVotes(roomID);
		roomVotesAnalytics.daily_percentage_change_in_upvotes =
			percentageChange.daily_percentage_change_in_upvotes;
		roomVotesAnalytics.daily_percentage_change_in_downvotes =
			percentageChange.daily_percentage_change_in_downvotes;
		return roomVotesAnalytics;
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

	async getKeyMetrics(userID: string): Promise<RoomAnalyticsKeyMetricsDto> {
		console.log(" and given userID: ", userID);
		const keyMetrics: RoomAnalyticsKeyMetricsDto =
			new RoomAnalyticsKeyMetricsDto();
		keyMetrics.unique_visitors = await this.getUniqueVisitors(userID);
		keyMetrics.returning_visitors = await this.getReturningVisitors(userID);
		keyMetrics.average_session_duration =
			await this.getAverageSessionDuration(userID);
		return keyMetrics;
	}

	async getUniqueVisitors(
		userID: string,
	): Promise<RoomAnalyticsKeyMetricsDto["unique_visitors"]> {
		const uniqueVisitors: RoomAnalyticsKeyMetricsDto["unique_visitors"] = {
			count: 0,
			percentage_change: 0,
		};
		// get the unique visitors for a user's all rooms
		const rooms: PrismaTypes.room[] = await this.prisma.room.findMany({
			where: {
				room_creator: userID,
			},
		});
		const roomIDs: any[] = rooms.map((r) => Prisma.sql`${r.room_id}::UUID`);
		console.log(
			"Getting unique visitors for user",
			userID,
			"and rooms",
			roomIDs,
		);
		// get unique visitors from more than 24 hours ago, then get unique visitors from the last 24 hours to calculate the percentage change
		const today: Date = new Date();
		const yesterday: Date = subHours(today, 24);
		// make the query to get the unique visitors

		/**
		 * SELECT
		 * 	COUNT(DISTINCT user_id) as count
		 * FROM
		 * 	user_activity
		 * WHERE
		 * 	room_id IN (roomIDs)
		 * 	AND room_join_time < yesterday
		 * GROUP BY
		 * 	user_id
		 *
		 * PROVIDE THE PRISMA QUERY FOR THIS
		 */
		const uniqueVisitorsYesterday: any = await this.prisma.$queryRaw(Prisma.sql`
			SELECT
				COUNT(DISTINCT user_id) as count
			FROM
				user_activity
			WHERE
				room_id IN (${Prisma.join(roomIDs)})
				AND room_join_time < ${yesterday}
			GROUP BY
				user_id;
		`);

		const uniqueVisitorsToday: any = await this.prisma.$queryRaw(Prisma.sql`
			SELECT
				COUNT(DISTINCT user_id) as count
			FROM
				user_activity
			WHERE
				room_id IN (${Prisma.join(roomIDs)})
				AND room_join_time > ${yesterday}
			GROUP BY
				user_id;
		`);
		console.log(
			"Unique visitors yesterday",
			uniqueVisitorsYesterday,
			"Unique visitors today",
			uniqueVisitorsToday,
		);
		// if (uniqueVisitorsYesterday.length === 0 || uniqueVisitorsToday.length === 0) {
		// 	return uniqueVisitors;
		// }

		const countYesterday: number = Number(uniqueVisitorsYesterday.length);
		const countToday: number = Number(uniqueVisitorsToday.length);
		uniqueVisitors.count = countToday + countYesterday;
		uniqueVisitors.percentage_change =
			countYesterday === 0 ? 0 : (countToday - countYesterday) / countYesterday;
		return uniqueVisitors;
	}

	async getAverageSessionDuration(
		userID: string,
	): Promise<RoomAnalyticsKeyMetricsDto["average_session_duration"]> {
		const averageSessionDuration: RoomAnalyticsKeyMetricsDto["average_session_duration"] =
			{
				duration: 0,
				percentage_change: 0,
			};
		// get the average session duration for a user's all rooms
		const rooms: PrismaTypes.room[] = await this.prisma.room.findMany({
			where: {
				room_creator: userID,
			},
		});
		const roomIDs: any[] = rooms.map((r) => Prisma.sql`${r.room_id}::UUID`);
		console.log(
			"Getting average session duration for user",
			userID,
			"and rooms",
			roomIDs,
		);
		// get the average session duration from more than 24 hours ago, then get the average session duration from the last 24 hours to calculate the percentage change
		const today: Date = new Date();
		const yesterday: Date = subHours(today, 24);
		const averageSessionDurationYesterday: any = await this.prisma
			.$queryRaw(Prisma.sql`
			SELECT
				AVG(EXTRACT(EPOCH FROM (room_leave_time - room_join_time))) as avg_duration
			FROM
				user_activity
			WHERE
				room_id IN (${Prisma.join(roomIDs)})
				AND room_join_time < ${yesterday}
			GROUP BY
				user_id;
		`);
		const averageSessionDurationToday: any = await this.prisma
			.$queryRaw(Prisma.sql`
			SELECT
				AVG(EXTRACT(EPOCH FROM (room_leave_time - room_join_time))) as avg_duration
			FROM
				user_activity
			WHERE
				room_id IN (${Prisma.join(roomIDs)})
				AND room_join_time > ${yesterday}
			GROUP BY
				user_id;
		`);
		console.log(
			"Average session duration yesterday",
			averageSessionDurationYesterday,
			"Average session duration today",
			averageSessionDurationToday,
		);
		// if (averageSessionDurationYesterday.length === 0 || averageSessionDurationToday.length === 0) {
		// 	return averageSessionDuration;
		// }
		// sum the durations and divide by the number of sessionser, b: number) => a + b, 0) / averageSessionDurationToday.length);
		const totalDurationYesterday: number = Number(
			averageSessionDurationYesterday
				.map((r: any) => Number(r.avg_duration))
				.reduce((a: number, b: number) => a + b, 0),
		);
		const totalDurationToday: number = Number(
			averageSessionDurationToday
				.map((r: any) => Number(r.avg_duration))
				.reduce((a: number, b: number) => a + b, 0),
		);
		const durationYesterday: number =
			averageSessionDurationYesterday.length === 0
				? 0
				: totalDurationYesterday / averageSessionDurationYesterday.length;
		const durationToday: number =
			averageSessionDurationToday.length === 0
				? 0
				: totalDurationToday / averageSessionDurationToday.length;
		averageSessionDuration.duration = (durationToday + durationYesterday) / 2;
		averageSessionDuration.percentage_change =
			durationYesterday === 0
				? 0
				: (durationToday - durationYesterday) / durationYesterday;
		return averageSessionDuration;
	}
	async getReturningVisitors(
		userID: string,
	): Promise<RoomAnalyticsKeyMetricsDto["returning_visitors"]> {
		const returningVisitors: RoomAnalyticsKeyMetricsDto["returning_visitors"] =
			{
				count: 0,
				percentage_change: 0,
			};

		// get the returning visitors for a user's all rooms
		const rooms: PrismaTypes.room[] = await this.prisma.room.findMany({
			where: {
				room_creator: userID,
			},
		});
		const roomIDs: any[] = rooms.map((r) => Prisma.sql`${r.room_id}::UUID`);
		console.log(
			"Getting returning visitors for user",
			userID,
			"and rooms",
			roomIDs,
			Prisma.join(roomIDs),
		);
		// get returning visitors from more than 24 hours ago, then get unique visitors from the last 24 hours to calculate the percentage change
		// returning visitors are users who have joined a room more than once
		const today: Date = new Date();
		const yesterday: Date = subHours(today, 24);
		const returningVisitorsYesterday: any = await this.prisma
			.$queryRaw(Prisma.sql`
			SELECT
				COUNT(user_id) as count,
				user_id
			FROM
				user_activity
			WHERE
				room_id IN (${Prisma.join(roomIDs)})
				AND room_join_time < ${yesterday}
			GROUP BY
				user_id
			HAVING
				COUNT(user_id) > 1;
		`);
		const returningVisitorsToday: any = await this.prisma.$queryRaw(Prisma.sql`
			SELECT
				COUNT(user_id) as count,
				user_id
			FROM
				user_activity
			WHERE
				room_id IN (${Prisma.join(roomIDs)})
				AND room_join_time > ${yesterday}
			GROUP BY
				user_id
			HAVING
				COUNT(user_id) > 1;
		`);
		// if (returningVisitorsYesterday.length === 0 || returningVisitorsToday.length === 0) {
		// 	return returningVisitors;
		// }
		const countYesterday: number = Number(returningVisitorsYesterday.length);
		const countToday: number = Number(returningVisitorsToday.length);
		returningVisitors.count = countToday + countYesterday;
		returningVisitors.percentage_change =
			countYesterday === 0 ? 0 : (countToday - countYesterday) / countYesterday;
		return returningVisitors;
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

	async getCurrentRoom(userID: string): Promise<PrismaTypes.room | null> {
		if (!(await this.dbUtils.userExists(userID))) {
			throw new HttpException("User does not exist", HttpStatus.NOT_FOUND);
		}
		const room: any = await this.prisma.participate.findFirst({
			where: {
				user_id: userID,
			},
			include: {
				room: true,
			},
		});
		// if the user is in a room, get the join time from the user_activity table.
		// do the query on user id and retrieve the activity with a leave date of null
		// if the user is not in a room, return null
		if (room === null) {
			throw new HttpException("User is not in a room", HttpStatus.NOT_FOUND);
		}
		const userActivity: any = await this.prisma.user_activity.findFirst({
			where: {
				user_id: userID,
				room_id: room.room_id,
				room_leave_time: null,
			},
		});
		// add the join date to the returned object
		try {
			room.room_join_time = userActivity.room_join_time;
		} catch (error) {
			console.error("Error getting room join time:", error);
			throw new HttpException(
				"Error getting room join time",
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}
		return room;
	}
}
