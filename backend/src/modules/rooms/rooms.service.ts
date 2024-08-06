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
import { subHours, addHours, isBefore } from 'date-fns';
import {
	RoomAnalyticsQueueDto,
	RoomAnalyticsParticipationDto,
	RoomAnalyticsInteractionsDto,
	RoomAnalyticsVotesDto,
	RoomAnalyticsSongsDto,
	RoomAnalyticsContributorsDto,
	RoomAnalyticsDto,
} from "./dto/roomanalytics.dto";

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
			}
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
		const roomQueueAnalytics: RoomAnalyticsQueueDto = new RoomAnalyticsQueueDto();
		const roomQueue: SongInfoDto[] = await this.getRoomQueue(roomID);
		roomQueueAnalytics.total_songs_queued = roomQueue.length;
		roomQueueAnalytics.total_queue_exports = 0; // TODO: Implement logic to get total queue exports
		return roomQueueAnalytics;
	}

	async getRoomJoinAnalytics(roomID: string): Promise<RoomAnalyticsParticipationDto["joins"]> {
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

		if (userActivityPerDay.length === 0) {
			return joins;
		}

		for (let i = 0; i < userActivityPerDay.length; i++) {
			userActivityPerDay[i].count = Number(userActivityPerDay[i].count);
			total_joins += userActivityPerDay[i].count;
		}
		for (let i = 0; i < uniqueUserActivityPerDay.length; i++) {
			uniqueUserActivityPerDay[i].count = Number(uniqueUserActivityPerDay[i].count);
			unique_joins += uniqueUserActivityPerDay[i].count;
		}
		const allDays: Date[] = [];
		const today: Date = new Date();
		let day: Date = userActivityPerDay[0].day;
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
		roomID: string
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

		// fill in the missing days
		const allDays: Date[] = [];
		const today: Date = new Date();
		const firstDay: Date = sessionDurations[0].day;
		let day: Date = firstDay;
		while (isBefore(day, today)) {
			allDays.push(day);
			day = addHours(day, 24);
		}
		// add the missing days
		for (const d of allDays) {
			const dayExists: boolean = sessionDurations.find(
				(u: any) => u.day === d,
			);
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
		roomID: string
	): Promise<RoomAnalyticsParticipationDto["participants_per_hour"]> {
		const participantsPerHour: RoomAnalyticsParticipationDto["participants_per_hour"] = [];
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
		console.log("Getting room hourly participant analytics for room", roomID, "and user activity", userActivityPerHour);
		if (userActivityPerHour.length === 0) {
			return participantsPerHour;
		}

		const allHours: Date[] = [];
		let hour: Date = userActivityPerHour[0].hour;
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

	async getRoomPreviews(
		roomID: string
	): Promise<number> {
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

		const roomAnalyticsParticipation: RoomAnalyticsParticipationDto = new RoomAnalyticsParticipationDto();
		roomAnalyticsParticipation.joins = await this.getRoomJoinAnalytics(roomID);
		roomAnalyticsParticipation.session_data = await this.getRoomSessionAnalytics(roomID);
		roomAnalyticsParticipation.participants_per_hour = await this.getHourlyParticipantAnalytics(roomID);
		roomAnalyticsParticipation.room_previews = await this.getRoomPreviews(roomID);
		roomAnalyticsParticipation.return_visits = await this.getReturnVisitsAnalytics(roomID, roomAnalyticsParticipation.joins.all_time.total_joins);
		return roomAnalyticsParticipation;
	}

	async getReturnVisitsAnalytics(
		roomID: string,
		totalVisits: number,
	): Promise<RoomAnalyticsParticipationDto["return_visits"]> {
		const returnVisits: RoomAnalyticsParticipationDto["return_visits"] = {
			expected_return_count: 0,
			probability_of_return: 0
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
		const averageVisits: number = result.map((r: any) => Number(r.user_count)).reduce((a: number, b: number) => a + b, 0) / result.length;
		returnVisits.probability_of_return = returnCount/totalVisits;
		returnVisits.expected_return_count = averageVisits;
		return returnVisits;
	}

	async getMessageInteractionsAnalytics(
		roomID: string
	): Promise<RoomAnalyticsInteractionsDto["messages"]> {
		console.log(
			"Getting room analytics for room",
			roomID,
		);
		const messages: RoomAnalyticsInteractionsDto["messages"] = {
			per_hour: [],
			total: 0,
		};
		const today: Date = new Date();
		const yesterday: Date = subHours(today, 24);
		console.log("Today", today, "Yesterday", yesterday);
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
		console.log("Getting room message interactions analytics for room", roomID, "and message activity", messageActivityPerHour);
		if (messageActivityPerHour.length === 0) {
			return messages;
		}
		// fill in the missing hours
		const allHours: Date[] = [];
		let hour: Date = messageActivityPerHour[0].hour;
		while (isBefore(hour, today)) {
			allHours.push(hour);
			hour = addHours(hour, 1);
		}
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
		messages.total = messages.per_hour.map((m) => m.count).reduce((a, b) => a + b, 0);
		return messages;
	}

	async getNumberOfReactions(roomID: string): Promise<number> {
		const reactions: any = await this.prisma.chat_reactions.findMany({
			where: {
				room_id: roomID,
			},
		});
		console.log("Getting number of reactions for room", roomID, "and reactions", reactions);
		if (!reactions || reactions === null) {
			return 0;
		}
		return reactions.length;
	}

	async getNumberOfBookmarks(roomID: string): Promise<number> {
		const bookmarks: PrismaTypes.bookmark[] | null = await this.prisma.bookmark.findMany({
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

		const roomInteractionAnalytics: RoomAnalyticsInteractionsDto = new RoomAnalyticsInteractionsDto();
		roomInteractionAnalytics.messages = await this.getMessageInteractionsAnalytics(roomID);
		roomInteractionAnalytics.bookmarked_count = await this.getNumberOfBookmarks(roomID);
		roomInteractionAnalytics.reactions_sent = await this.getNumberOfReactions(roomID);
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
		const numOfUpvotes: number = Number(votes.filter((v: any) => v.is_upvote)[0].count);
		const numOfDownvotes: number = Number(votes.filter((v: any) => !v.is_upvote)[0].count);
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
		console.log("Getting percentage change in votes for room", roomID, "and votes", votesToday, votesYesterday);
		const numOfUpvotesToday: number = Number(votesToday.filter((v: any) => v.is_upvote)[0].count);
		const numOfDownvotesToday: number = Number(votesToday.filter((v: any) => !v.is_upvote)[0].count);
		const numOfUpvotesYesterday: number = Number(votesYesterday.filter((v: any) => v.is_upvote)[0].count);
		const numOfDownvotesYesterday: number = Number(votesYesterday.filter((v: any) => !v.is_upvote)[0].count);
		const upvoteChange: number = numOfUpvotesToday - numOfUpvotesYesterday;
		const downvoteChange: number = numOfDownvotesToday - numOfDownvotesYesterday;
		const upvotePercentageChange: number = (upvoteChange / numOfUpvotesYesterday) * 100;
		const downvotePercentageChange: number = (downvoteChange / numOfDownvotesYesterday) * 100;
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
		const roomVotesAnalytics: RoomAnalyticsVotesDto = new RoomAnalyticsVotesDto();
		const votes: any = await this.getTotalVotes(roomID);
		roomVotesAnalytics.total_upvotes = votes.upvotes;
		roomVotesAnalytics.total_downvotes = votes.downvotes;
		const percentageChange: any = await this.getPercentageChangeInVotes(roomID);
		roomVotesAnalytics.daily_percentage_change_in_upvotes = percentageChange.daily_percentage_change_in_upvotes;
		roomVotesAnalytics.daily_percentage_change_in_downvotes = percentageChange.daily_percentage_change_in_downvotes;
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
}
