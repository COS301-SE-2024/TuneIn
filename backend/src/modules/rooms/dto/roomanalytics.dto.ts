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
export class RoomAnalyticsKeyMetricsDto {
	// an object called unique visitors with two properties, count and percentage_change. both are numbers
	@ApiProperty({
		description: "Unique visitors to the user's rooms",
		type: "object",
	})
	@IsObject()
	@ValidateNested()
	unique_visitors: {
		count: number;
		percentage_change: number;
	};
	// an object called returning_visitors with two properties, count and percentage_change. both are numbers
	@ApiProperty({
		description: "Returning visitors to the user's rooms",
		type: "object",
	})
	@IsObject()
	@ValidateNested()
	returning_visitors: {
		count: number;
		percentage_change: number;
	};
	// an object called average_session_duration with two properties, duration and percentage_change. both are numbers
	@ApiProperty({
		description: "Average session duration in the user's rooms",
		type: "object",
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

export class RoomAnalyticsParticipationDto {
	@ApiProperty({
		description:
			"Join statistics, including total and unique joins per day and all-time",
		type: "object",
	})
	@IsObject()
	@ValidateNested()
	joins: {
		per_day: {
			total_joins: { count: number; day: Date }[];
			unique_joins: { count: number; day: Date }[];
		};
		all_time: {
			total_joins: number;
			unique_joins: number;
		};
	};

	@ApiProperty({
		description: "Participants per hour data",
		type: [ParticipantsPerHourDto],
	})
	@IsObject()
	@ValidateNested()
	participants_per_hour: ParticipantsPerHourDto[];

	@ApiProperty({
		description:
			"Session data including average, minimum, and maximum duration all-time and per day",
		type: "object",
	})
	@IsObject()
	@ValidateNested()
	session_data: {
		all_time: {
			avg_duration: number;
			min_duration: number;
			max_duration: number;
		};

		per_day: {
			avg_duration: { duration: number; day: Date }[];
			min_duration: { duration: number; day: Date }[];
			max_duration: { duration: number; day: Date }[];
		}[];
	};

	@ApiProperty({
		description: "Expected return visits and probability of return",
		type: "object",
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

export class RoomAnalyticsInteractionsDto {
	@ApiProperty({
		description: "Total messages sent and messages sent per hour",
		type: "object",
	})
	@IsObject()
	@ValidateNested()
	messages: {
		total: number;
		per_hour: {
			count: number;
			hour: Date;
		}[];
	};

	@ApiProperty({ description: "Total number of reactions sent in the room" })
	@IsNumber()
	reactions_sent: number;

	@ApiProperty({ description: "Number of times the room was bookmarked" })
	@IsNumber()
	bookmarked_count: number;
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
		type: "array",
	})
	@IsArray()
	@ValidateNested()
	songs: SongAnalyticsDto[];
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

export class RoomAnalyticsSongsDto {
	@ApiProperty({
		description: "Most played songs in the room",
		type: [SongAnalyticsDto],
	})
	@IsArray()
	@ValidateNested()
	most_played: SongAnalyticsDto[];

	@ApiProperty({
		description: "Top voted songs in the room",
		type: [SongAnalyticsDto],
	})
	@IsArray()
	@ValidateNested()
	top_voted: SongAnalyticsDto[];
}

export class RoomAnalyticsContributorsDto {
	@ApiProperty({
		description: "Top contributors to the room's queue",
		type: "object",
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
	queue: RoomAnalyticsQueueDto;

	@ApiProperty({
		description: "Participation analytics",
		type: RoomAnalyticsParticipationDto,
	})
	@IsObject()
	@ValidateNested()
	participation: RoomAnalyticsParticipationDto;

	@ApiProperty({
		description: "Interactions analytics",
		type: RoomAnalyticsInteractionsDto,
	})
	@IsObject()
	@ValidateNested()
	interactions: RoomAnalyticsInteractionsDto;

	@ApiProperty({ description: "Votes analytics", type: RoomAnalyticsVotesDto })
	@IsObject()
	@ValidateNested()
	votes: RoomAnalyticsVotesDto;

	@ApiProperty({ description: "Songs analytics", type: RoomAnalyticsSongsDto })
	@IsObject()
	@ValidateNested()
	songs: RoomAnalyticsSongsDto;

	@ApiProperty({
		description: "Contributors analytics",
		type: RoomAnalyticsContributorsDto,
	})
	@IsObject()
	@ValidateNested()
	contributors: RoomAnalyticsContributorsDto;
}
