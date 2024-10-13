import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
	IsString,
	ValidateNested,
	IsObject,
	IsNumber,
	IsArray,
	IsBoolean,
} from "class-validator";
import { SongInfoDto } from "../../rooms/dto/songinfo.dto";
import { Type } from "class-transformer";

export class FollowersAndFollowing {
	@ApiProperty()
	@IsNumber()
	count: number;

	@ApiProperty({ type: () => UserDto, isArray: true })
	@IsArray()
	@ValidateNested()
	@Type(() => UserDto)
	data: UserDto[];
}

export class RoomsData {
	@ApiProperty()
	@IsNumber()
	count: number;

	/*
	@ApiProperty({ type: () => RoomDto, isArray: true })
	@IsArray()
	@ValidateNested()
	@Type(() => RoomDto)
	data: RoomDto[];
	*/
	@ApiProperty({ type: String, isArray: true })
	@IsArray()
	@IsString({ each: true })
	data: string[];
}

export class SongInfosWithCount {
	@ApiProperty()
	@IsNumber()
	count: number;

	@ApiProperty({ type: () => SongInfoDto, isArray: true })
	@IsArray()
	@ValidateNested()
	@Type(() => SongInfoDto)
	data: SongInfoDto[];
}

export class LinksWithCount {
	@ApiProperty()
	@IsNumber()
	count: number;

	@ApiProperty({
		type: "object",
		additionalProperties: {
			type: "array",
			items: { type: "string" },
		},
	})
	@IsObject()
	data: Record<string, string[]>;
}

export class GenresWithCount {
	@ApiProperty()
	@IsNumber()
	count: number;

	@ApiProperty({ type: String, isArray: true })
	@IsArray()
	@IsString({ each: true })
	data: string[];
}

export class UserFriendship {
	@ApiProperty()
	@IsBoolean()
	status: boolean;

	@ApiProperty()
	@IsString()
	accept_url: string;

	@ApiProperty()
	@IsString()
	reject_url: string;
}

export class UserDto {
	@ApiProperty()
	@IsString()
	profile_name: string;

	@ApiProperty()
	@IsString()
	userID: string;

	@ApiProperty()
	@IsString()
	username: string;

	@ApiProperty()
	@IsString()
	profile_picture_url: string;

	@ApiProperty({
		description: "The user's followers",
		title: "FollowersAndFollowing",
		type: FollowersAndFollowing,
	})
	@IsObject()
	@ValidateNested()
	@Type(() => FollowersAndFollowing)
	followers: FollowersAndFollowing;

	@ApiProperty({
		description: "The user's following",
		title: "FollowersAndFollowing",
		type: FollowersAndFollowing,
	})
	@IsObject()
	@ValidateNested()
	@Type(() => FollowersAndFollowing)
	following: FollowersAndFollowing;

	@ApiProperty({
		description: "The user's links",
		type: LinksWithCount,
	})
	@IsObject()
	@ValidateNested()
	@Type(() => LinksWithCount)
	links: LinksWithCount;

	@ApiPropertyOptional()
	@IsString()
	bio: string;

	@ApiPropertyOptional({
		description: "The current song the user is listening to, if applicable",
		type: SongInfoDto,
	})
	@IsObject()
	@ValidateNested()
	@Type(() => SongInfoDto)
	current_song?: SongInfoDto;

	@ApiPropertyOptional({
		description:
			"The roomID of the room that the user is currently in, if applicable",
	})
	@IsString()
	@ValidateNested()
	current_room_id?: string;

	@ApiProperty({
		description: "The user's favorite genres",
		type: GenresWithCount,
	})
	@IsObject()
	@ValidateNested()
	@Type(() => GenresWithCount)
	fav_genres: GenresWithCount;

	@ApiProperty({
		description: "The user's favorite songs",
		type: SongInfosWithCount,
	})
	@IsObject()
	@ValidateNested()
	@Type(() => SongInfosWithCount)
	fav_songs: SongInfosWithCount;

	@ApiProperty({
		description: "The user's favorite rooms",
		type: RoomsData,
	})
	@IsObject()
	@ValidateNested()
	@Type(() => RoomsData)
	fav_rooms: RoomsData;

	@ApiProperty({
		description: "The user's recent rooms",
		type: RoomsData,
	})
	@IsObject()
	@ValidateNested()
	@Type(() => RoomsData)
	recent_rooms: RoomsData;

	@ApiPropertyOptional({
		description:
			"The user's friendship status with the current user, or null if the user is not friends with the current user",
		type: UserFriendship,
	})
	@IsObject()
	@ValidateNested()
	@Type(() => UserFriendship)
	friendship?: UserFriendship;

	// optional field for relationship status
	@ApiPropertyOptional({
		description:
			"The relationship status between the current user and the user in question",
		type: String,
	})
	@Type(() => String)
	@IsString()
	relationship?:
		| "following"
		| "follower"
		| "mutual"
		| "friend"
		| "pending"
		| "none"
		| "blocked";
}
