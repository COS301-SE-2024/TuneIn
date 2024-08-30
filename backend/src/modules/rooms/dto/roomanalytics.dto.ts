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

export class RoomAnalyticsParticipationDto {
	@ApiProperty({
		description:
			"Join statistics, including total and unique joins per day and all-time",
		type: "object",
		properties: {
			per_day: {
				type: "object",
				properties: {
					total_joins: {
						type: "array",
						items: {
							type: "object",
							properties: {
								count: { type: "number" },
								day: { type: "Date" },
							},
						},
					},
					unique_joins: {
						type: "array",
						items: {
							type: "object",
							properties: {
								count: { type: "number" },
								day: { type: "Date" },
							},
						},
					},
				},
			},
			all_time: {
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
		type: ParticipantsPerHourDto,
		isArray: true,
	})
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => ParticipantsPerHourDto)
	participants_per_hour: ParticipantsPerHourDto[];

	@ApiProperty({
		description:
			"Session data including average, minimum, and maximum duration all-time and per day",
		type: "object",
		properties: {
			all_time: {
				type: "object",
				properties: {
					avg_duration: { type: "number" },
					min_duration: { type: "number" },
					max_duration: { type: "number" },
				},
			},
			per_day: {
				type: "array",
				items: {
					type: "object",
					properties: {
						avg_duration: {
							type: "array",
							items: {
								type: "object",
								properties: {
									duration: { type: "number" },
									day: { type: "Date" },
								},
							},
						},
						min_duration: {
							type: "array",
							items: {
								type: "object",
								properties: {
									duration: { type: "number" },
									day: { type: "Date" },
								},
							},
						},
						max_duration: {
							type: "array",
							items: {
								type: "object",
								properties: {
									duration: { type: "number" },
									day: { type: "Date" },
								},
							},
						},
					},
				},
			},
		},
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

export class RoomAnalyticsInteractionsDto {
	@ApiProperty({
		description: "Total messages sent and messages sent per hour",
		type: "object",
		properties: {
			total: { type: "number" },
			per_hour: {
				type: "array",
				items: {
					type: "object",
					properties: {
						count: { type: "number" },
						hour: { type: "Date" },
					},
				},
			},
		},
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
		description: "Top contributors to the room's queue",
		type: "object",
		properties: {
			user: { type: "UserDto" },
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
