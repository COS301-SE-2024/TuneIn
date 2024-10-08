import {
	Controller,
	Delete,
	Get,
	Query,
	Request,
	UseGuards,
} from "@nestjs/common";
import {
	SearchService,
	CombinedSearchResults,
	CombinedSearchHistory,
} from "./search.service";
import {
	ApiBadRequestResponse,
	ApiBearerAuth,
	ApiOkResponse,
	ApiOperation,
	ApiQuery,
	ApiSecurity,
	ApiTags,
} from "@nestjs/swagger";
import { UserDto } from "../users/dto/user.dto";
import { RoomDto } from "../rooms/dto/room.dto";
import { SearchHistoryDto } from "./dto/searchhistorydto";
import { JwtAuthGuard } from "./../../auth/jwt-auth.guard";
import { AuthService, JWTPayload } from "./../../auth/auth.service";

@Controller("search")
@ApiTags("search")
export class SearchController {
	constructor(
		private readonly searchService: SearchService,
		private readonly auth: AuthService,
	) {}

	@ApiBearerAuth()
	@ApiSecurity("bearer")
	@UseGuards(JwtAuthGuard)
	@Get()
	@ApiOperation({
		summary: "Search for rooms and users",
		description:
			"Search for rooms and users by room name, creator name or username.",
		operationId: "search",
	})
	@ApiOkResponse({
		description: "Search results as an array of mixed UserDto and RoomDto.",
		type: CombinedSearchResults,
	})
	@ApiBadRequestResponse({ description: "Invalid query parameters" })
	@ApiQuery({
		name: "q",
		required: true,
		description: "A room name / username",
		type: String,
		example: {
			room_name: {
				value: "Chill Room",
			},
			username: {
				value: "johndoe123",
			},
		},
		allowEmptyValue: false,
	})
	@ApiQuery({
		name: "creator",
		required: false,
		description: "A room creator's profile name or username",
		type: String,
		examples: {
			profile_name: {
				value: "John Doe",
			},
			username: {
				value: "johndoe123",
			},
		},
	})
	async combinedSearch(
		@Query("q") q: string,
		@Request() req: Request,
		@Query("creator") creator?: string,
	): Promise<CombinedSearchResults> {
		const query_params: {
			q: string;
			creator?: string;
		} = {
			q,
		};
		if (creator) {
			query_params.creator = creator;
		}
		const userInfo: JWTPayload = this.auth.getUserInfo(req);
		const result = await this.searchService.combinedSearch(
			query_params,
			userInfo.id,
		);
		this.searchService.insertSearchHistory(
			"/search",
			query_params,
			userInfo.id,
		);

		return result;
	}

	/* ************************************************** */
	@ApiBearerAuth()
	@ApiSecurity("bearer")
	@UseGuards(JwtAuthGuard)
	@Get("rooms")
	@ApiOperation({
		summary: "Search for rooms",
		description: "Search for rooms by room name or creator name / username.",
		operationId: "searchRooms",
	})
	@ApiOkResponse({
		description: "Search results as an array of RoomDto.",
		type: RoomDto,
		isArray: true,
	})
	@ApiBadRequestResponse({ description: "Invalid query parameters" })
	@ApiQuery({
		name: "q",
		required: true,
		description: "A room name",
		type: String,
		example: "Chill Room",
		allowEmptyValue: false,
	})
	@ApiQuery({
		name: "creator",
		required: false,
		description: "A room creator's profile name / username",
		type: String,
		examples: {
			profile_name: {
				value: "John Doe",
			},
			username: {
				value: "johndoe123",
			},
		},
		allowEmptyValue: false,
	})
	async searchRooms(
		@Query("q") q: string,
		@Request() req: Request,
		@Query("creator") creator?: string,
	): Promise<RoomDto[]> {
		const query_params: {
			q: string;
			creator?: string;
		} = {
			q,
		};
		if (creator) {
			query_params.creator = creator;
		}
		const userInfo: JWTPayload = this.auth.getUserInfo(req);
		const result = await this.searchService.searchRooms(
			query_params,
			userInfo.id,
		);

		console.log("Result room search: " + JSON.stringify(result));

		if (JSON.stringify(result) === "[]") {
			this.searchService.insertSearchHistory(
				"/search/rooms",
				query_params,
				userInfo.id,
			);
		} else {
			this.searchService.insertSearchHistory(
				"/search/rooms",
				query_params,
				userInfo.id,
			);
		}

		return result;
	}

	/* ************************************************** */

	@ApiBearerAuth()
	@ApiSecurity("bearer")
	@UseGuards(JwtAuthGuard)
	/*
	@ApiHeader({
		name: "Authorization",
		description: "Bearer token for authentication",
	})
	*/
	@Get("history")
	@ApiOperation({
		summary: "Get search history (including objects discovered from search)",
		operationId: "searchHistory",
	})
	@ApiOkResponse({
		description:
			"Search history as an array of strings or RoomDto, or UserDto.",
		type: CombinedSearchHistory,
		isArray: true,
	})
	async searchHistory(
		@Request() req: Request,
	): Promise<CombinedSearchHistory[]> {
		const userInfo: JWTPayload = this.auth.getUserInfo(req);
		return await this.searchService.searchHistory(userInfo.id);
	}

	/* ************************************************** */

	@ApiBearerAuth()
	@ApiSecurity("bearer")
	@UseGuards(JwtAuthGuard)
	/*
	@ApiHeader({
		name: "Authorization",
		description: "Bearer token for authentication",
	})
	*/
	@Delete("history")
	@ApiOperation({
		summary: "Clear search history",
		description: "Clear search history for the user.",
		operationId: "clearSearchHistory",
	})
	@ApiOkResponse({ description: "Search history cleared" })
	async clearSearchHistory(@Request() req: Request): Promise<void> {
		const userInfo: JWTPayload = this.auth.getUserInfo(req);
		await this.searchService.clearSearchHistory(userInfo.id);
	}

	/* ************************************************** */
	@ApiBearerAuth()
	@ApiSecurity("bearer")
	@UseGuards(JwtAuthGuard)
	@Get("rooms/advanced")
	@ApiOperation({
		summary: "Advanced search for rooms",
		description: "Advanced search for rooms by various parameters.",
		operationId: "advancedSearchRooms",
	})
	@ApiOkResponse({
		description: "Search results as an array of RoomDto.",
		type: RoomDto,
		isArray: true,
	})
	@ApiBadRequestResponse({ description: "Invalid query parameters" })
	@ApiQuery({
		name: "q",
		required: true,
		description: "A room name",
		type: String,
		example: "Chill Room",
		allowEmptyValue: false,
	})
	@ApiQuery({
		name: "creator_username",
		required: false,
		description: "A room creator's username",
		type: String,
		example: "johndoe123",
		allowEmptyValue: false,
	})
	@ApiQuery({
		name: "creator_name",
		required: false,
		description: "A room creator's profile name",
		type: String,
		example: "John Doe",
		allowEmptyValue: false,
	})
	@ApiQuery({
		name: "participant_count",
		required: false,
		description: "Minimum number of participants",
		type: "number",
		example: 5,
		allowEmptyValue: false,
	})
	@ApiQuery({
		name: "description",
		required: false,
		description: "A string to find in the room description",
		type: String,
		example: "chill",
		allowEmptyValue: false,
	})
	@ApiQuery({
		name: "is_temp",
		required: false,
		description: "Is the room temporary?",
		type: "boolean",
	})
	@ApiQuery({
		name: "is_priv",
		required: false,
		description: "Is the room private?",
		type: "boolean",
	})
	@ApiQuery({
		name: "is_scheduled",
		required: false,
		description: "Is the room scheduled?",
		type: "boolean",
	})
	@ApiQuery({
		name: "start_date",
		required: false,
		description: "Only if scheduled, the start date",
		type: String,
	})
	@ApiQuery({
		name: "end_date",
		required: false,
		description: "Only if scheduled, the end date",
		type: String,
	})
	@ApiQuery({
		name: "lang",
		required: false,
		description: "The room language (as a ISO 639-1 code)",
		type: String,
	})
	@ApiQuery({
		name: "explicit",
		required: false,
		description: "Is the room explicit?",
		type: "boolean",
	})
	@ApiQuery({
		name: "nsfw",
		required: false,
		description: "Is the room NSFW?",
		type: "boolean",
	})
	@ApiQuery({
		name: "tags",
		required: false,
		description: "A comma separated list of tags to compare",
		type: String,
	})
	async advancedSearchRooms(
		@Request() req: Request,
		@Query("q") q: string,
		@Query("creator_username") creator_username?: string,
		@Query("creator_name") creator_name?: string,
		@Query("participant_count") participant_count?: number,
		@Query("description") description?: string,
		@Query("is_temp") is_temp?: boolean,
		@Query("is_priv") is_priv?: boolean,
		@Query("is_scheduled") is_scheduled?: boolean,
		@Query("start_date") start_date?: string,
		@Query("end_date") end_date?: string,
		@Query("lang") lang?: string,
		@Query("explicit") explicit?: boolean,
		@Query("nsfw") nsfw?: boolean,
		@Query("tags") tags?: string,
	): Promise<RoomDto[]> {
		const query_params: {
			q: string;
			creator_username?: string;
			creator_name?: string;
			participant_count?: number;
			description?: string;
			is_temp?: boolean;
			is_priv?: boolean;
			is_scheduled?: boolean;
			start_date?: string;
			end_date?: string;
			lang?: string;
			explicit?: boolean;
			nsfw?: boolean;
			tags?: string;
		} = {
			q,
		};
		if (creator_username) {
			query_params.creator_name = creator_username;
		}
		if (creator_name) {
			query_params.creator_name = creator_name;
		}
		if (participant_count) {
			query_params.participant_count = participant_count;
		}
		if (description) {
			query_params.description = description;
		}
		if (is_temp) {
			query_params.is_temp = is_temp;
		}
		if (is_priv) {
			query_params.is_priv = is_priv;
		}
		if (is_scheduled) {
			query_params.is_scheduled = is_scheduled;
		}
		if (start_date) {
			query_params.start_date = start_date;
		}
		if (end_date) {
			query_params.end_date = end_date;
		}
		if (lang) {
			query_params.lang = lang;
		}
		if (explicit) {
			query_params.explicit = explicit;
		}
		if (nsfw) {
			query_params.nsfw = nsfw;
		}
		if (tags) {
			query_params.tags = tags;
		}
		const userInfo: JWTPayload = this.auth.getUserInfo(req);
		return await this.searchService.advancedSearchRooms(
			query_params,
			userInfo.id,
		);
	}

	/* ************************************************** */

	@ApiBearerAuth()
	@ApiSecurity("bearer")
	@UseGuards(JwtAuthGuard)
	/*
	@ApiHeader({
		name: "Authorization",
		description: "Bearer token for authentication",
	})
	*/
	@Get("rooms/history")
	@ApiOperation({
		summary: "Get recently searched rooms",
		description: "Get recently searched rooms by the user.",
		operationId: "searchRoomsHistory",
	})
	@ApiOkResponse({
		description: "Recently searched rooms as an array of SearchHistoryDto.",
		type: SearchHistoryDto,
		isArray: true,
	})
	@ApiBadRequestResponse({ description: "Invalid query parameters" })
	async searchRoomsHistory(
		@Request() req: Request,
	): Promise<SearchHistoryDto[]> {
		const userInfo: JWTPayload = this.auth.getUserInfo(req);
		return await this.searchService.searchRoomsHistory(userInfo.id);
	}

	/* ************************************************** */

	@Get("rooms/suggestions")
	@ApiOperation({
		summary: "Get recommended room search terms.",
		description: "Get recommended room search terms.",
		operationId: "searchRoomsSuggestion",
	})
	@ApiOkResponse({
		description: "room search suggestions as an array of SearchHistoryDto.",
		type: SearchHistoryDto,
		isArray: true,
	})
	@ApiBadRequestResponse({ description: "Invalid query parameters" })
	@ApiQuery({
		name: "q",
		required: true,
		description: "A room name",
		type: String,
		example: "Chill Room",
		allowEmptyValue: false,
	})
	async searchRoomsSuggestion(
		@Query("q") q: string,
	): Promise<SearchHistoryDto[]> {
		return await this.searchService.searchRoomsSuggestions(q);
	}

	/* ************************************************** */

	@ApiBearerAuth()
	@ApiSecurity("bearer")
	@UseGuards(JwtAuthGuard)
	/*
	@ApiHeader({
		name: "Authorization",
		description: "Bearer token for authentication",
	})
	*/
	@Delete("rooms/history")
	@ApiOperation({
		summary: "Clear room search history",
		description: "Clear room search history for the user.",
		operationId: "clearRoomsHistory",
	})
	@ApiOkResponse({ description: "Room search history cleared" })
	async clearRoomsHistory(@Request() req: Request): Promise<void> {
		const userInfo: JWTPayload = this.auth.getUserInfo(req);
		await this.searchService.clearRoomsHistory(userInfo.id);
	}

	/* ************************************************** */

	@ApiBearerAuth()
	@ApiSecurity("bearer")
	@UseGuards(JwtAuthGuard)
	@Get("users")
	@ApiOperation({
		summary: "Search for users",
		description: "Search for users by username or profile name.",
		operationId: "searchUsers",
	})
	@ApiOkResponse({
		description: "Search results as an array of UserDto.",
		type: UserDto,
		isArray: true,
	})
	@ApiBadRequestResponse({ description: "Invalid query parameters" })
	@ApiQuery({
		name: "q",
		required: true,
		description: "A username or profile name",
		type: String,
		examples: {
			username: {
				value: "johndoe123",
			},
			profile_name: {
				value: "John Doe",
			},
		},
		allowEmptyValue: false,
	})
	async searchUsers(
		@Query("q") q: string,
		@Request() req: Request,
	): Promise<UserDto[]> {
		const userInfo: JWTPayload = this.auth.getUserInfo(req);
		const result = await this.searchService.searchUsers(q, userInfo.id);
		console.log("User search result: " + JSON.stringify(result));
		this.searchService.insertSearchHistory(
			"/search/users",
			{ q: q },
			userInfo.id,
		);

		return result;
	}

	/* ************************************************** */

	@ApiBearerAuth()
	@ApiSecurity("bearer")
	@UseGuards(JwtAuthGuard)
	@Get("users/advanced")
	@ApiOperation({
		summary: "Advanced search for users",
		description: "Advanced search for users by various parameters.",
		operationId: "advancedSearchUsers",
	})
	@ApiOkResponse({
		description: "Search results as an array of UserDto.",
		type: UserDto,
		isArray: true,
	})
	@ApiBadRequestResponse({ description: "Invalid query parameters" })
	@ApiQuery({
		name: "q",
		required: true,
		description: "A username or profile name",
		type: String,
		examples: {
			username: {
				value: "johndoe123",
			},
			profile_name: {
				value: "John Doe",
			},
		},
		allowEmptyValue: false,
	})
	@ApiQuery({
		name: "creator_username",
		required: false,
		description: "A user's username",
		type: String,
		example: "johndoe123",
		allowEmptyValue: false,
	})
	@ApiQuery({
		name: "creator_name",
		required: false,
		description: "A user's profile name",
		type: String,
		example: "John Doe",
		allowEmptyValue: false,
	})
	@ApiQuery({
		name: "following",
		required: false,
		description: "Minimum number of following",
		type: "number",
		example: 10,
		allowEmptyValue: false,
	})
	@ApiQuery({
		name: "followers",
		required: false,
		description: "Minimum number of followers",
		type: "number",
		example: 10,
		allowEmptyValue: false,
	})
	async advancedSearchUsers(
		@Request() req: Request,
		@Query("q") q: string,
		@Query("creator_username") creator_username?: string,
		@Query("creator_name") creator_name?: string,
		@Query("following") following?: number,
		@Query("followers") followers?: number,
	): Promise<UserDto[]> {
		const query_params: {
			q: string;
			creator_username?: string;
			creator_name?: string;
			following?: number;
			followers?: number;
		} = {
			q,
		};
		if (creator_username) {
			query_params.creator_name = creator_username;
		}
		if (creator_name) {
			query_params.creator_name = creator_name;
		}
		if (following) {
			query_params.following = following;
		}
		if (followers) {
			query_params.followers = followers;
		}
		const userInfo: JWTPayload = this.auth.getUserInfo(req);
		return await this.searchService.advancedSearchUsers(
			query_params,
			userInfo.id,
		);
	}

	/* ************************************************** */

	@ApiBearerAuth()
	@ApiSecurity("bearer")
	@UseGuards(JwtAuthGuard)
	/*
	@ApiHeader({
		name: "Authorization",
		description: "Bearer token for authentication",
	})
	*/
	@Get("users/history")
	@ApiOperation({
		summary: "Get recently searched users",
		description: "Get recently searched users by the user.",
		operationId: "searchUsersHistory",
	})
	@ApiOkResponse({
		description: "Recently searched users as an array of SearchHistoryDto.",
		type: SearchHistoryDto,
		isArray: true,
	})
	@ApiBadRequestResponse({ description: "Invalid query parameters" })
	async searchUsersHistory(
		@Request() req: Request,
	): Promise<SearchHistoryDto[]> {
		const userInfo: JWTPayload = this.auth.getUserInfo(req);
		return await this.searchService.searchUsersHistory(userInfo.id);
	}

	/* ************************************************** */

	@Get("users/suggestions")
	@ApiOperation({
		summary: "Get recommended user search terms.",
		description: "Get recommended user search terms.",
		operationId: "searchUsersSuggestion",
	})
	@ApiOkResponse({
		description: "user search suggestions as an array of SearchHistoryDto.",
		type: SearchHistoryDto,
		isArray: true,
	})
	@ApiBadRequestResponse({ description: "Invalid query parameters" })
	@ApiQuery({
		name: "q",
		required: true,
		description: "A user name",
		type: String,
		example: "John",
		allowEmptyValue: false,
	})
	async searchUsersSuggestion(
		@Query("q") q: string,
	): Promise<SearchHistoryDto[]> {
		return await this.searchService.searchUsersSuggestions(q);
	}

	/* ************************************************** */

	@ApiBearerAuth()
	@ApiSecurity("bearer")
	@UseGuards(JwtAuthGuard)
	/*
	@ApiHeader({
		name: "Authorization",
		description: "Bearer token for authentication",
	})
	*/
	@Delete("users/history")
	@ApiOperation({
		summary: "Clear user search history",
		description: "Clear user search history for the user.",
		operationId: "clearUsersHistory",
	})
	@ApiOkResponse({ description: "User search history cleared" })
	async clearUsersHistory(@Request() req: Request): Promise<void> {
		const userInfo: JWTPayload = this.auth.getUserInfo(req);
		await this.searchService.clearUsersHistory(userInfo.id);
	}

	/* ************************************************** */
	/*
	@Get("genres")
	@ApiOperation({ summary: "Search for genres" })
	@ApiOkResponse({
		description: "Search results as an array of strings.",
		type: [String],
	})
	@ApiBadRequestResponse({ description: "Invalid query parameters" })
	@ApiQuery({
		name: "q",
		required: true,
		description: "A genre name",
		type: String,
	})
	async searchGenres(@Query("q") q: string): Promise<string[]> {
		return await this.searchService.searchGenres(q);
	}
		*/
}
