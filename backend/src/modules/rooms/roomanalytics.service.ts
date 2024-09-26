import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../prisma/prisma.service";
import * as PrismaTypes from "@prisma/client";
import { Prisma } from "@prisma/client";
import {
	subHours,
	addHours,
	isBefore,
	startOfHour,
	startOfDay,
} from "date-fns";
import {
	RoomAnalyticsParticipationDto,
	RoomAnalyticsInteractionsDto,
	RoomAnalyticsKeyMetricsDto,
} from "./dto/roomanalytics.dto";

@Injectable()
export class RoomAnalyticsService {
	constructor(
		private readonly prisma: PrismaService, // private readonly dtogen: DtoGenService, // private readonly dbUtils: DbUtilsService, // private readonly rooms: RoomsService,
	) {}

	async getRoomJoinAnalytics(
		roomID: string,
	): Promise<RoomAnalyticsParticipationDto["joins"]> {
		let total_joins = 0;
		let unique_joins = 0;
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
		const userActivityPerDay: {
			day: Date;
			count: number;
		}[] = await this.prisma.$queryRaw`
			SELECT DATE_TRUNC('day', "room_join_time") AS day,
				COUNT("user_id")::INTEGER as count
			FROM "user_activity"
			WHERE room_id = ${roomID}::UUID
			GROUP BY day, room_id
			ORDER BY day ASC;
		`;
		const uniqueUserActivityPerDay: {
			day: Date;
			count: number;
		}[] = await this.prisma.$queryRaw`
			SELECT DATE_TRUNC('day', "room_join_time") AS day,
				COUNT(DISTINCT "user_id")::INTEGER as count
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

		if (userActivityPerDay.length === 0 || userActivityPerDay === undefined) {
			return joins;
		}

		for (let i = 0; i < userActivityPerDay.length; i++) {
			total_joins += Number(userActivityPerDay[i]?.count ?? 0);
		}
		for (let i = 0; i < uniqueUserActivityPerDay.length; i++) {
			unique_joins += Number(uniqueUserActivityPerDay[i]?.count ?? 0);
		}
		// fill in the missing days
		// get all the days from the first day the room was created until today if the room is not older than 7 days
		// if the room is older than 7 days, get all the days from 7 days ago until today
		const allDays: Date[] = [];
		const today: Date = addHours(startOfDay(new Date()), 3);
		const firstDay: Date | undefined = userActivityPerDay[0]?.day;
		if (!firstDay) {
			return joins;
		}
		let day: Date = roomCreationDate ?? firstDay;
		day = subHours(startOfDay(day), 22);
		if (isBefore(day, subHours(today, 24 * 7))) {
			day = subHours(today, 24 * 7);
		}
		//floor the day to the nearest day
		// add the first day
		while (isBefore(day, today)) {
			allDays.push(day);
			day = addHours(day, 24);
		}
		// add the missing days
		for (const d of allDays) {
			const dayExists: boolean =
				userActivityPerDay.find((u) => {
					return u.day.getTime() === d.getTime();
				}) !== undefined;
			if (!dayExists) {
				userActivityPerDay.push({ day: d, count: 0 });
			}
		}
		// add the missing days
		for (const d of allDays) {
			const dayExists: boolean =
				uniqueUserActivityPerDay.find(
					(u) => u.day.getTime() === d.getTime(),
				) !== undefined;
			if (!dayExists) {
				uniqueUserActivityPerDay.push({ day: d, count: 0 });
			}
		}
		// sort the arrays
		userActivityPerDay.sort((a, b) => a.day.getTime() - b.day.getTime());
		uniqueUserActivityPerDay.sort((a, b) => a.day.getTime() - b.day.getTime());
		joins.per_day = {
			total_joins:
				userActivityPerDay.length > 7
					? userActivityPerDay.slice(
							userActivityPerDay.length - 7,
							userActivityPerDay.length,
					  )
					: userActivityPerDay,
			unique_joins:
				uniqueUserActivityPerDay.length > 7
					? uniqueUserActivityPerDay.slice(
							uniqueUserActivityPerDay.length - 7,
							uniqueUserActivityPerDay.length,
					  )
					: uniqueUserActivityPerDay,
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
		let avg_duration = 0,
			min_duration = 0,
			max_duration = 0;
		const sessionData: RoomAnalyticsParticipationDto["session_data"] = {
			all_time: {
				avg_duration: 0,
				min_duration: 0,
				max_duration: 0,
			},
			per_day: [],
		};
		const sessionDurations: {
			avg_duration: number;
			min_duration: number;
			max_duration: number;
			day: Date;
		}[] = await this.prisma.$queryRaw`
			SELECT DATE_TRUNC('day', room_join_time) AS day,
				AVG(EXTRACT(EPOCH FROM (room_leave_time - room_join_time)))::FLOAT AS avg_duration,
				MIN(NULLIF(EXTRACT(EPOCH FROM (room_leave_time - room_join_time)), 0))::FLOAT AS min_duration,
				MAX(EXTRACT(EPOCH FROM (room_leave_time - room_join_time)))::FLOAT AS max_duration
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
		const firstDay: Date | undefined = sessionDurations[0]?.day;
		let day: Date | undefined = roomCreationDate ?? firstDay;
		if (!day) {
			return sessionData;
		}
		if (isBefore(day, subHours(today, 24 * 7))) {
			day = subHours(today, 24 * 7);
		}
		//floor the day to the nearest day
		day = subHours(startOfDay(day), 22);
		while (isBefore(day, today)) {
			allDays.push(day);
			day = addHours(day, 24);
		}

		day = subHours(startOfDay(day), 22);
		for (const d of allDays) {
			const dayExists: boolean =
				sessionDurations.find((u) => u.day.getTime() === d.getTime()) !==
				undefined;
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
		sessionDurations.sort((a, b) => a.day.getTime() - b.day.getTime());
		for (let i = 0; i < sessionDurations.length; i++) {
			const session = sessionDurations[i];
			if (session === undefined) {
				continue;
			}
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
		sessionData.per_day = sessionDurations
			.map((session) => ({
				...session,
				duration: Number(session.avg_duration),
			}))
			.sort((a, b) => a.day.getTime() - b.day.getTime());
		sessionData.per_day =
			sessionData.per_day.length > 7
				? sessionData.per_day.slice(
						sessionData.per_day.length - 7,
						sessionData.per_day.length,
				  )
				: sessionData.per_day;
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
		//type cast count in the query to number
		const userActivityPerHour: {
			hour: Date;
			count: number;
		}[] = await this.prisma.$queryRaw`
			SELECT DATE_TRUNC('hour', room_join_time) AS hour,
				COUNT("user_id")::INTEGER as count
			FROM "user_activity"
			WHERE room_id = ${roomID}::UUID
			AND room_join_time > ${yesterday}
			GROUP BY hour, room_id
			ORDER BY hour ASC;
		`;
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
		let hour: Date | undefined =
			roomCreationDate ?? userActivityPerHour[0]?.hour;
		if (!hour) {
			return participantsPerHour;
		}
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
			const hourExists: boolean =
				userActivityPerHour.find((u) => u.hour.getTime() === h.getTime()) !==
				undefined;
			if (!hourExists) {
				userActivityPerHour.push({ hour: h, count: 0 });
			}
		}
		// sort the array
		userActivityPerHour.sort((a, b) => a.hour.getTime() - b.hour.getTime());
		for (const hour of userActivityPerHour) {
			const pph = {
				count: 0,
				instance: new Date(),
			};
			pph.count = Number(hour.count);
			pph.instance = hour.hour;
			participantsPerHour.push(pph);
		}
		return participantsPerHour;
	}

	async getRoomPreviews(roomID: string): Promise<number> {
		const previews: PrismaTypes.room_previews[] | null =
			await this.prisma.room_previews.findMany({
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
		roomAnalyticsParticipation.room_previews = await this.getRoomPreviews(
			roomID,
		);
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
		const result: {
			user_count: number;
			user_id: string;
		}[] = await this.prisma.$queryRaw`
		SELECT
			COUNT(user_id)::INTEGER as user_count,
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
		const returnCount: number = result.length;
		const averageVisits: number =
			result
				.map((r) => Number(r.user_count))
				.reduce((a: number, b: number) => a + b, 0) / result.length;
		returnVisits.probability_of_return = Number(returnCount / totalVisits);
		returnVisits.expected_return_count = Number(averageVisits);
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
		const room: PrismaTypes.room | null = await this.prisma.room.findUnique({
			where: {
				room_id: roomID,
			},
		});

		const roomCreationDate: Date | null = room?.date_created ?? null;
		const messageActivityPerHour: {
			hour: Date;
			count: number;
		}[] = await this.prisma.$queryRaw`
			SELECT DATE_TRUNC('hour', date_sent) AS hour,
				COUNT(message.message_id)::INTEGER as count
			FROM "message"
			INNER JOIN room_message ON room_message.message_id = message.message_id
			WHERE room_id = ${roomID}::UUID
				AND date_sent > ${yesterday}
			GROUP BY hour, room_id
			ORDER BY hour ASC;
		`;

		// fill in the missing hours
		let allHours: Date[] = [];
		// from from the date the room was created, get all the hours until now if the room is not older than a day
		let hour: Date = roomCreationDate ?? new Date();
		if (isBefore(hour, yesterday)) {
			hour = yesterday;
		}
		//floor the hour to the nearest hour
		hour = startOfHour(hour);

		// let hour: Date = messageActivityPerHour[0].hour ;
		while (isBefore(hour, today)) {
			allHours.push(hour);
			hour = addHours(hour, 1);
		}
		// remove the last element of the array
		allHours = allHours.slice(0, allHours.length - 1);
		// add the missing hours
		for (const h of allHours) {
			const hourExists: boolean =
				messageActivityPerHour.find((u) => u.hour === h) !== undefined;
			if (!hourExists) {
				messageActivityPerHour.push({ hour: h, count: 0 });
			}
		}
		// sort the array
		messageActivityPerHour.sort((a, b) => a.hour.getTime() - b.hour.getTime());
		for (const hour of messageActivityPerHour) {
			const m = {
				count: 0,
				hour: new Date(),
			};
			m.count = Number(hour.count);
			m.hour = hour.hour;
			messages.per_hour.push(m);
		}
		messages.total = messages.per_hour
			.map((m) => m.count)
			.reduce((a, b) => a + b, 0);
		return messages;
	}

	async getNumberOfReactions(roomID: string): Promise<number> {
		const reactions: PrismaTypes.chat_reactions[] =
			await this.prisma.chat_reactions.findMany({
				where: {
					room_id: roomID,
				},
			});
		if (!reactions || reactions === null) {
			return 0;
		}
		return reactions.length;
	}

	async getNumberOfBookmarks(roomID: string): Promise<number> {
		const bookmarks: PrismaTypes.bookmark[] =
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
		roomInteractionAnalytics.bookmarked_count = await this.getNumberOfBookmarks(
			roomID,
		);
		roomInteractionAnalytics.reactions_sent = await this.getNumberOfReactions(
			roomID,
		);
		return roomInteractionAnalytics;
	}

	async getKeyMetrics(
		userID: string,
		period: string,
	): Promise<RoomAnalyticsKeyMetricsDto> {
		console.log(" and given userID: ", userID);
		const keyMetrics: RoomAnalyticsKeyMetricsDto =
			new RoomAnalyticsKeyMetricsDto();
		keyMetrics.unique_visitors = await this.getUniqueVisitors(userID, period);
		keyMetrics.returning_visitors = await this.getReturningVisitors(
			userID,
			period,
		);
		keyMetrics.average_session_duration = await this.getAverageSessionDuration(
			userID,
			period,
		);
		return keyMetrics;
	}

	async getUniqueVisitors(
		userID: string,
		period: string,
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
		const roomIDs: Prisma.Sql[] = rooms.map(
			(r) => Prisma.sql`${r.room_id}::UUID`,
		);
		// get unique visitors from more than 24 hours ago, then get unique visitors from the last 24 hours to calculate the percentage change
		const today: Date = new Date();
		let multiple = 1;
		if (period === "week") {
			multiple = 7;
		} else if (period === "month") {
			multiple = 30;
		}
		const yesterday: Date = subHours(today, 24 * multiple);
		const uniqueVisitorsYesterday: { count: number }[] = await this.prisma
			.$queryRaw(Prisma.sql`
			SELECT
				COUNT(DISTINCT user_id)::INTEGER as count
			FROM
				user_activity
			WHERE
				room_id IN (${Prisma.join(roomIDs)})
				AND room_join_time < ${yesterday}
			GROUP BY
				user_id;
		`);

		const uniqueVisitorsToday: { count: number }[] = await this.prisma
			.$queryRaw(Prisma.sql`
			SELECT
				COUNT(DISTINCT user_id)::INTEGER as count
			FROM
				user_activity
			WHERE
				room_id IN (${Prisma.join(roomIDs)})
				AND room_join_time >= ${yesterday}
			GROUP BY
				user_id;
		`);

		const countYesterday = Number(uniqueVisitorsYesterday.length);
		const countToday = Number(uniqueVisitorsToday.length);
		uniqueVisitors.count = countToday + countYesterday;
		uniqueVisitors.percentage_change =
			countYesterday === 0 ? 0 : (countToday - countYesterday) / countYesterday;
		return uniqueVisitors;
	}

	async getAverageSessionDuration(
		userID: string,
		period: string,
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
		const roomIDs: Prisma.Sql[] = rooms.map(
			(r) => Prisma.sql`${r.room_id}::UUID`,
		);
		console.log(
			"Getting average session duration for user",
			userID,
			"and rooms",
			roomIDs,
		);
		// get the average session duration from more than 24 hours ago, then get the average session duration from the last 24 hours to calculate the percentage change
		const today: Date = new Date();
		let multiple = 1;
		if (period === "week") {
			multiple = 7;
		} else if (period === "month") {
			multiple = 30;
		}
		const yesterday: Date = subHours(today, 24 * multiple);
		const averageSessionDurationYesterday: { avg_duration: number }[] =
			await this.prisma.$queryRaw(Prisma.sql`
			SELECT
				AVG(EXTRACT(EPOCH FROM (room_leave_time - room_join_time)))::FLOAT as avg_duration
			FROM
				user_activity
			WHERE
				room_id IN (${Prisma.join(roomIDs)})
				AND room_join_time < ${yesterday}
		`);
		const averageSessionDurationToday: { avg_duration: number }[] = await this
			.prisma.$queryRaw(Prisma.sql`
			SELECT
				AVG(EXTRACT(EPOCH FROM (room_leave_time - room_join_time)))::FLOAT as avg_duration
			FROM
				user_activity
			WHERE
				room_id IN (${Prisma.join(roomIDs)})
				AND room_join_time > ${yesterday}
		`);

		const averageSessionDurationAllTime: { avg_duration: number }[] = await this
			.prisma.$queryRaw(Prisma.sql`
			SELECT
				AVG(EXTRACT(EPOCH FROM (room_leave_time - room_join_time)))::FLOAT as avg_duration
			FROM
				user_activity
			WHERE
				room_id IN (${Prisma.join(roomIDs)});
		`);
		averageSessionDuration.duration = Number(
			averageSessionDurationAllTime[0]?.avg_duration,
		);
		averageSessionDuration.percentage_change =
			averageSessionDurationYesterday[0]?.avg_duration === 0
				? 0
				: (Number(averageSessionDurationToday[0]?.avg_duration) -
						Number(averageSessionDurationYesterday[0]?.avg_duration)) /
				  Number(averageSessionDurationYesterday[0]?.avg_duration);
		return averageSessionDuration;
	}
	async getReturningVisitors(
		userID: string,
		period: string,
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
		const roomIDs: Prisma.Sql[] = rooms.map(
			(r) => Prisma.sql`${r.room_id}::UUID`,
		);
		const today: Date = new Date();
		let multiple = 1;
		if (period === "week") {
			multiple = 7;
		} else if (period === "month") {
			multiple = 30;
		}
		const yesterday: Date = subHours(today, 24 * multiple);
		const returningVisitorsYesterday: { count: number; user_id: string }[] =
			await this.prisma.$queryRaw(Prisma.sql`
			SELECT
				COUNT(user_id)::INTEGER as count,
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
		const returningVisitorsToday: { count: number; user_id: string }[] =
			await this.prisma.$queryRaw(Prisma.sql`
			SELECT
				COUNT(user_id)::INTEGER as count,
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
		const countYesterday = Number(returningVisitorsYesterday.length);
		const countToday = Number(returningVisitorsToday.length);
		returningVisitors.count = countToday + countYesterday;
		returningVisitors.percentage_change =
			countYesterday === 0 ? 0 : (countToday - countYesterday) / countYesterday;
		return returningVisitors;
	}
}
