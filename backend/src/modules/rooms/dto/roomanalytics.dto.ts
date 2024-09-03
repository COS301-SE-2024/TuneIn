import { ApiProperty } from "@nestjs/swagger";
import {
	IsArray,
	IsDate,
	IsNumber,
	IsObject,
	IsString,
	ValidateNested,
} from "class-validator";
import { UserDto } from "../../users/dto/user.dto";
import { Type } from "class-transformer";
export class RoomAnalyticsKeyMetricsDto {
	// an object called unique visitors with two properties, count and percentage_change. both are numbers
	@ApiProperty({
		title: "UniqueVisitors",
		description: "Unique visitors to the user's rooms",
		type: "object",
		properties: {
			count: { type: "number" },
			percentage_change: { type: "number" },
		},
	})
	@IsObject()
	@ValidateNested()
	unique_visitors: {
		count: number;
		percentage_change: number;
	};

	// an object called returning_visitors with two properties, count and percentage_change. both are numbers
	@ApiProperty({
		title: "ReturningVisitors",
		description: "Returning visitors to the user's rooms",
		type: "object",
		properties: {
			count: { type: "number" },
			percentage_change: { type: "number" },
		},
	})
	@IsObject()
	@ValidateNested()
	returning_visitors: {
		count: number;
		percentage_change: number;
	};

	// an object called average_session_duration with two properties, duration and percentage_change. both are numbers
	@ApiProperty({
		title: "AverageSessionDuration",
		description: "Average session duration in the user's rooms",
		type: "object",
		properties: {
			duration: { type: "number" },
			percentage_change: { type: "number" },
		},
	})
	@IsObject()
	@ValidateNested()
	average_session_duration: {
		duration: number;
		percentage_change: number;
	};
}

export class RoomAnalyticsQueueDto {
	@ApiProperty({ description: "Total number of songs ever queued in the room" })
	@IsNumber()
	total_songs_queued: number;

	@ApiProperty({
		description: "Number of times the room's queue was exported as a playlist",
	})
	@IsNumber()
	total_queue_exports: number;
}

export class ParticipantsPerHourDto {
	@ApiProperty({
		description: "The number of participants in the room at the given hour",
	})
	@IsNumber()
	count: number;

	@ApiProperty({
		description: "The specific hour for participant count",
		type: Date,
	})
	@IsDate()
	instance: Date;
}

class AllTimeSessionDataDto {
	@ApiProperty({
		description: "The average session duration of the room",
	})
	@IsNumber()
	avg_duration: number;

	@ApiProperty({
		description: "The minimum session duration of the room",
	})
	@IsNumber()
	min_duration: number;

	@ApiProperty({
		description: "The maximum session duration of the room",
	})
	@IsNumber()
	max_duration: number;
}

class SessionDurationPerDayDto {
	@ApiProperty({ type: "number" })
	duration: number;

	@ApiProperty({ type: Date })
	day: Date;
}

export class SessionDataPerDayDto {
	@ApiProperty({ type: SessionDurationPerDayDto, isArray: true })
	@Type(() => SessionDurationPerDayDto)
	avg_duration: SessionDurationPerDayDto[];

	@ApiProperty({ type: SessionDurationPerDayDto, isArray: true })
	@Type(() => SessionDurationPerDayDto)
	min_duration: SessionDurationPerDayDto[];

	@ApiProperty({ type: SessionDurationPerDayDto, isArray: true })
	@Type(() => SessionDurationPerDayDto)
	max_duration: SessionDurationPerDayDto[];
}

class JoinsCount {
	@ApiProperty({ type: "number" })
	count: number;

	@ApiProperty({ type: Date })
	day: Date;
}

class JoinsPerDay {
	total_joins: JoinsCount[];
	unique_joins: JoinsCount[];
}

export class RoomAnalyticsParticipationDto {
	@ApiProperty({
		title: "Joins",
		description:
			"Join statistics, including total and unique joins per day and all-time",
		type: "object",
		properties: {
			per_day: {
				title: "JoinsPerDay",
				type: "object",
			},
			all_time: {
				title: "JoinsAllTime",
				type: "object",
				properties: {
					total_joins: { type: "number" },
					unique_joins: { type: "number" },
				},
			},
		},
	})
	@IsObject()
	@ValidateNested()
	joins: {
		per_day: JoinsPerDay;
		all_time: {
			total_joins: number;
			unique_joins: number;
		};
	};

	@ApiProperty({
		description: "Participants per hour data",
		type: ParticipantsPerHourDto,
		isArray: true,
	})
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => ParticipantsPerHourDto)
	participants_per_hour: ParticipantsPerHourDto[];

	@ApiProperty({
		title: "SessionData",
		description:
			"Session data including average, minimum, and maximum duration all-time and per day",
		type: "object",
		properties: {
			all_time: {
				type: "object",
				title: "AllTimeSessionDataDto",
			},
			per_day: {
				type: "array",
				items: {
					type: "object",
					title: "SessionDurationPerDayDto",
				},
			},
		},
	})
	@IsObject()
	@ValidateNested()
	session_data: {
		all_time: AllTimeSessionDataDto;
		per_day: SessionDurationPerDayDto[];
	};

	@ApiProperty({
		title: "ReturnVisits",
		description: "Expected return visits and probability of return",
		type: "object",
		properties: {
			expected_return_count: { type: "number" },
			probability_of_return: { type: "number" },
		},
	})
	@IsObject()
	@ValidateNested()
	return_visits: {
		expected_return_count: number;
		probability_of_return: number;
	};

	@ApiProperty({
		description: "Number of previews of the room, i.e. without joining",
	})
	@IsNumber()
	room_previews: number;
}

class MessagesPerHour {
	@ApiProperty({ type: "number" })
	count: number;

	@ApiProperty({ type: Date })
	hour: Date;
}

export class RoomAnalyticsInteractionsDto {
	@ApiProperty({
		title: "Messages",
		description: "Total messages sent and messages sent per hour",
		type: "object",
		properties: {
			total: { type: "number" },
			per_hour: {
				type: "array",
				items: {
					title: "MessagesPerHour",
					type: "object",
				},
			},
		},
	})
	@IsObject()
	@ValidateNested()
	messages: {
		total: number;
		per_hour: MessagesPerHour[];
	};

	@ApiProperty({ description: "Total number of reactions sent in the room" })
	@IsNumber()
	reactions_sent: number;

	@ApiProperty({ description: "Number of times the room was bookmarked" })
	@IsNumber()
	bookmarked_count: number;
}

export class SongAnalyticsDto {
	@ApiProperty({ description: "Spotify ID of the song" })
	@IsString()
	spotify_id: string;

	@ApiProperty({ description: "Internal song ID" })
	song_id: string;

	@ApiProperty({ description: "Number of times the song was played" })
	@IsNumber()
	plays: number;

	@ApiProperty({ description: "Number of upvotes the song received" })
	@IsNumber()
	upvotes: number;

	@ApiProperty({ description: "Number of downvotes the song received" })
	@IsNumber()
	downvotes: number;

	@ApiProperty({ description: "Rank of the song based on some criteria" })
	@IsNumber()
	rank: number;

	@ApiProperty({ description: "Global rank of the song across all rooms" })
	@IsNumber()
	global_rank: number;
}

export class RoomAnalyticsVotesDto {
	@ApiProperty({ description: "Total number of upvotes for songs in the room" })
	@IsNumber()
	total_upvotes: number;

	@ApiProperty({
		description: "Total number of downvotes for songs in the room",
	})
	@IsNumber()
	total_downvotes: number;

	@ApiProperty({
		description:
			"Daily percentage change in upvotes for songs in the room. (last 24 hours)",
	})
	@IsNumber()
	daily_percentage_change_in_upvotes: number;

	@ApiProperty({
		description:
			"Daily percentage change in downvotes for songs in the room. (last 24 hours)",
	})
	@IsNumber()
	daily_percentage_change_in_downvotes: number;

	@ApiProperty({
		description:
			"Details of songs including Spotify ID, song ID, upvotes, and downvotes",
		type: SongAnalyticsDto,
		isArray: true,
	})
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => SongAnalyticsDto)
	songs: SongAnalyticsDto[];
}

export class RoomAnalyticsSongsDto {
	@ApiProperty({
		title: "MostPlayed",
		description: "Most played songs in the room",
		type: SongAnalyticsDto,
		isArray: true,
	})
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => SongAnalyticsDto)
	most_played: SongAnalyticsDto[];

	@ApiProperty({
		description: "Top voted songs in the room",
		type: SongAnalyticsDto,
		isArray: true,
	})
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => SongAnalyticsDto)
	top_voted: SongAnalyticsDto[];
}

export class RoomAnalyticsContributorsDto {
	@ApiProperty({
		title: "TopContributors",
		description: "Top contributors to the room's queue",
		type: "object",
		properties: {
			user: { title: "UserDto", type: "object" },
			rank: { type: "number" },
			num_songs: { type: "number" },
			num_upvotes: { type: "number" },
		},
	})
	@IsObject()
	@ValidateNested()
	top_contributors: {
		user: UserDto;
		rank: number;
		num_songs: number;
		num_upvotes: number;
	};
}

export class RoomAnalyticsDto {
	@ApiProperty({ description: "Queue analytics", type: RoomAnalyticsQueueDto })
	@IsObject()
	@ValidateNested()
	@Type(() => RoomAnalyticsQueueDto)
	queue: RoomAnalyticsQueueDto;

	@ApiProperty({
		description: "Participation analytics",
		type: RoomAnalyticsParticipationDto,
	})
	@IsObject()
	@ValidateNested()
	@Type(() => RoomAnalyticsParticipationDto)
	participation: RoomAnalyticsParticipationDto;

	@ApiProperty({
		description: "Interactions analytics",
		type: RoomAnalyticsInteractionsDto,
	})
	@IsObject()
	@ValidateNested()
	@Type(() => RoomAnalyticsInteractionsDto)
	interactions: RoomAnalyticsInteractionsDto;

	@ApiProperty({ description: "Votes analytics", type: RoomAnalyticsVotesDto })
	@IsObject()
	@ValidateNested()
	@Type(() => RoomAnalyticsVotesDto)
	votes: RoomAnalyticsVotesDto;

	@ApiProperty({ description: "Songs analytics", type: RoomAnalyticsSongsDto })
	@IsObject()
	@ValidateNested()
	@Type(() => RoomAnalyticsSongsDto)
	songs: RoomAnalyticsSongsDto;

	@ApiProperty({
		description: "Contributors analytics",
		type: RoomAnalyticsContributorsDto,
	})
	@IsObject()
	@ValidateNested()
	@Type(() => RoomAnalyticsContributorsDto)
	contributors: RoomAnalyticsContributorsDto;
}
