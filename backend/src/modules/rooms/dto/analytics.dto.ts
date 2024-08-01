import { ApiProperty } from "@nestjs/swagger";
import { UserDto } from "src/modules/users/dto/user.dto";

export class RoomAnalyticsQueueDto {
	@ApiProperty()
	total_songs_queued: number;

	@ApiProperty()
	total_songs_exported: number;
}

export class ParticipantsPerHourDto {
	@ApiProperty()
	count: number;

	@ApiProperty()
	instance: Date;
}

export class RoomAnalyticsParticipationDto {
	@ApiProperty()
	joins: {
		per_day: {
            @ApiProperty({ type: () => [{ count: Number, day: Date }] })
            total_joins: { count: number; day: Date }[];
        
            @ApiProperty({ type: () => [{ count: Number, day: Date }] })
            unique_joins: { count: number; day: Date }[];
        };
		all_time: {
            @ApiProperty()
            total_joins: number;
        
            @ApiProperty()
            unique_joins: number;
        }
	};

	@ApiProperty({ type: [ParticipantsPerHourDto] })
	participants_per_hour: ParticipantsPerHourDto[];

	@ApiProperty()
	session_data: {
		all_time: {
            @ApiProperty()
            avg_duration: number;
        
            @ApiProperty()
            min_duration: number;
        
            @ApiProperty()
            max_duration: number;
        };

		per_day: {
            @ApiProperty({ type: () => [{ duration: Number, day: Date }] })
            avg_duration: { duration: number; day: Date }[];
        
            @ApiProperty({ type: () => [{ duration: Number, day: Date }] })
            min_duration: { duration: number; day: Date }[];
        
            @ApiProperty({ type: () => [{ duration: Number, day: Date }] })
            max_duration: { duration: number; day: Date }[];
        }[];
	};

	@ApiProperty()
	return_visits: {
        @ApiProperty()
        expected_return_count: number;
    
        @ApiProperty()
        probability_of_return: number;
    };

	@ApiProperty()
	room_previews: number;
}

export class RoomAnalyticsInteractionsDto {
	@ApiProperty()
	messages: {
		total: number;
		per_hour: ParticipantsPerHourDto[];
	};

	@ApiProperty()
	reactions_sent: number;

	@ApiProperty()
	bookmarked_count: number;
}

export class RoomAnalyticsVotesDto {
	@ApiProperty()
	total_upvotes: number;

	@ApiProperty()
	total_downvotes: number;

	@ApiProperty()
	daily_percentage_change_in_upvotes: number;

	@ApiProperty()
	daily_percentage_change_in_downvotes: number;

	@ApiProperty()
	songs: {
        @ApiProperty()
        spotify_id: string;
    
        @ApiProperty()
        song_id: string;
    
        @ApiProperty()
        upvotes: number;
    
        @ApiProperty()
        downvotes: number;
    }[];
}

export class SongAnalyticsDto {
	@ApiProperty()
	spotify_id: string;

	@ApiProperty()
	song_id: string;

	@ApiProperty()
	plays: number;

	@ApiProperty()
	upvotes: number;

	@ApiProperty()
	downvotes: number;

	@ApiProperty()
	rank: number;

	@ApiProperty()
	global_rank: number;
}

export class RoomAnalyticsSongsDto {
	@ApiProperty({ type: [SongAnalyticsDto] })
	most_played: SongAnalyticsDto[];

	@ApiProperty({ type: [SongAnalyticsDto] })
	top_voted: SongAnalyticsDto[];
}

export class RoomAnalyticsContributorsDto {
	@ApiProperty()
	top_contributors: {
        @ApiProperty({ type: UserDto })
        user: UserDto;
    
        @ApiProperty()
        rank: number;
    
        @ApiProperty()
        num_songs: number;
    
        @ApiProperty()
        num_upvotes: number;
    }
}

export class RoomAnalyticsDto {
	@ApiProperty({ type: RoomAnalyticsQueueDto })
	queue: RoomAnalyticsQueueDto;

	@ApiProperty({ type: RoomAnalyticsParticipationDto })
	participation: RoomAnalyticsParticipationDto;

	@ApiProperty({ type: RoomAnalyticsInteractionsDto })
	interactions: RoomAnalyticsInteractionsDto;

	@ApiProperty({ type: RoomAnalyticsVotesDto })
	votes: RoomAnalyticsVotesDto;

	@ApiProperty({ type: RoomAnalyticsSongsDto })
	songs: RoomAnalyticsSongsDto;

	@ApiProperty({ type: RoomAnalyticsContributorsDto })
	contributors: RoomAnalyticsContributorsDto;
}
