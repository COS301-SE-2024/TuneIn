import { ApiProperty } from "@nestjs/swagger";
import {
	IsArray,
	IsDate,
	IsNumber,
	IsObject,
	IsString,
	ValidateNested,
} from "class-validator";
import { UserDto } from "src/modules/users/dto/user.dto";

export class RoomAnalyticsQueueDto {
	@ApiProperty()
	@IsNumber()
	total_songs_queued: number;

	@ApiProperty()
	@IsNumber()
	total_songs_exported: number;
}

export class ParticipantsPerHourDto {
	@ApiProperty()
	@IsNumber()
	count: number;

	@ApiProperty()
	@IsDate()
	instance: Date;
}

export class RoomAnalyticsParticipationDto {
	@ApiProperty()
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

	@ApiProperty()
	@IsObject()
	@ValidateNested()
	participants_per_hour: ParticipantsPerHourDto[];

	@ApiProperty()
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

	@ApiProperty()
	@IsObject()
	@ValidateNested()
	return_visits: {
		expected_return_count: number;
		probability_of_return: number;
	};

	@ApiProperty()
	@IsNumber()
	room_previews: number;
}

export class RoomAnalyticsInteractionsDto {
	@ApiProperty()
	@IsObject()
	@ValidateNested()
	messages: {
		total: number;
		per_hour: ParticipantsPerHourDto[];
	};

	@ApiProperty()
	@IsNumber()
	reactions_sent: number;

	@ApiProperty()
	@IsNumber()
	bookmarked_count: number;
}

export class RoomAnalyticsVotesDto {
	@ApiProperty()
	@IsNumber()
	total_upvotes: number;

	@ApiProperty()
	@IsNumber()
	total_downvotes: number;

	@ApiProperty()
	@IsNumber()
	daily_percentage_change_in_upvotes: number;

	@ApiProperty()
	@IsNumber()
	daily_percentage_change_in_downvotes: number;

	@ApiProperty()
	@IsArray()
	@ValidateNested()
	songs: {
		spotify_id: string;
		song_id: string;
		upvotes: number;
		downvotes: number;
	}[];
}

export class SongAnalyticsDto {
	@ApiProperty()
	@IsString()
	spotify_id: string;

	@ApiProperty()
	song_id: string;

	@ApiProperty()
	@IsNumber()
	plays: number;

	@ApiProperty()
	@IsNumber()
	upvotes: number;

	@ApiProperty()
	@IsNumber()
	downvotes: number;

	@ApiProperty()
	@IsNumber()
	rank: number;

	@ApiProperty()
	@IsNumber()
	global_rank: number;
}

export class RoomAnalyticsSongsDto {
	@ApiProperty({ type: [SongAnalyticsDto] })
	@IsArray()
	@ValidateNested()
	most_played: SongAnalyticsDto[];

	@ApiProperty({ type: [SongAnalyticsDto] })
	@IsArray()
	@ValidateNested()
	top_voted: SongAnalyticsDto[];
}

export class RoomAnalyticsContributorsDto {
	@ApiProperty()
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
	@ApiProperty({ type: RoomAnalyticsQueueDto })
	@IsObject()
	@ValidateNested()
	queue: RoomAnalyticsQueueDto;

	@ApiProperty({ type: RoomAnalyticsParticipationDto })
	@IsObject()
	@ValidateNested()
	participation: RoomAnalyticsParticipationDto;

	@ApiProperty({ type: RoomAnalyticsInteractionsDto })
	@IsObject()
	@ValidateNested()
	interactions: RoomAnalyticsInteractionsDto;

	@ApiProperty({ type: RoomAnalyticsVotesDto })
	@IsObject()
	@ValidateNested()
	votes: RoomAnalyticsVotesDto;

	@ApiProperty({ type: RoomAnalyticsSongsDto })
	@IsObject()
	@ValidateNested()
	songs: RoomAnalyticsSongsDto;

	@ApiProperty({ type: RoomAnalyticsContributorsDto })
	@IsObject()
	@ValidateNested()
	contributors: RoomAnalyticsContributorsDto;
}
