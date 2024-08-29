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
	ApiHeader,
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
		@Query("creator") creator?: string,
	): Promise<CombinedSearchResults> {
		const query_params = {
			q,
			creator,
		};
		const result = await this.searchService.combinedSearch(query_params);
		// const userInfo: JWTPayload = this.auth.getUserInfo(req);
		// this.searchService.insertSearchHistory(
		// 	"/search",
		// 	query_params,
		// 	userInfo.id,
		// 	ctx,
		// );

		return result;
	}

	/* ************************************************** */
	@Get("rooms")
	@ApiOperation({
		summary: "Search for rooms",
		description: "Search for rooms by room name or creator name / username.",
		operationId: "searchRooms",
	})
	@ApiOkResponse({
		description: "Search results as an array of RoomDto.",
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
		@Query("creator") creator?: string,
	): Promise<RoomDto[]> {
		const query_params = {
			q,
			creator,
		};
		const result = await this.searchService.searchRooms(query_params);
		// const userInfo: JWTPayload = this.auth.getUserInfo(req);
		console.log("Result" + typeof result);

		// this.searchService.insertSearchHistory(
		// 	"/search/rooms",
		// 	query_params,
		// 	userInfo.id,
		// 	ctx,
		// );

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
		type: [CombinedSearchHistory],
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

	@Get("rooms/advanced")
	@ApiOperation({
		summary: "Advanced search for rooms",
		description: "Advanced search for rooms by various parameters.",
		operationId: "advancedSearchRooms",
	})
	@ApiOkResponse({
		description: "Search results as an array of RoomDto.",
		type: [RoomDto],
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
		const query_params = {
			q,
			creator_username,
			creator_name,
			participant_count,
			description,
			is_temp,
			is_priv,
			is_scheduled,
			start_date,
			end_date,
			lang,
			explicit,
			nsfw,
			tags,
		};
		return await this.searchService.advancedSearchRooms(query_params);
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
		type: [SearchHistoryDto],
	})
	@ApiBadRequestResponse({ description: "Invalid query parameters" })
	async searchRoomsHistory(
		@Request() req: Request,
	): Promise<SearchHistoryDto[]> {
		const userInfo: JWTPayload = this.auth.getUserInfo(req);
		return await this.searchService.searchRoomsHistory(userInfo.id);
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

	@Get("users")
	@ApiOperation({
		summary: "Search for users",
		description: "Search for users by username or profile name.",
		operationId: "searchUsers",
	})
	@ApiOkResponse({
		description: "Search results as an array of UserDto.",
		type: [UserDto],
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
	async searchUsers(@Query("q") q: string): Promise<UserDto[]> {
		const result = await this.searchService.searchUsers(q);
		// const userInfo: JWTPayload = this.auth.getUserInfo(req);

		// this.searchService.insertSearchHistory(
		// 	"/search/users",
		// 	{ q: q },
		// 	userInfo.id,
		// 	ctx,
		// );

		return result;
	}

	/* ************************************************** */

	@Get("users/advanced")
	@ApiOperation({
		summary: "Advanced search for users",
		description: "Advanced search for users by various parameters.",
		operationId: "advancedSearchUsers",
	})
	@ApiOkResponse({
		description: "Search results as an array of UserDto.",
		type: [UserDto],
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
		@Query("q") q: string,
		@Query("creator_username") creator_username?: string,
		@Query("creator_name") creator_name?: string,
		@Query("following") following?: number,
		@Query("followers") followers?: number,
	): Promise<UserDto[]> {
		const query_params = {
			q,
			creator_username,
			creator_name,
			following,
			followers,
		};
		return await this.searchService.advancedSearchUsers(query_params);
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
		type: [SearchHistoryDto],
	})
	@ApiBadRequestResponse({ description: "Invalid query parameters" })
	async searchUsersHistory(
		@Request() req: Request,
	): Promise<SearchHistoryDto[]> {
		const userInfo: JWTPayload = this.auth.getUserInfo(req);
		return await this.searchService.searchUsersHistory(userInfo.id);
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
