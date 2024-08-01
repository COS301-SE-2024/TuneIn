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
	ApiTags,
} from "@nestjs/swagger";
import { UserDto } from "../users/dto/user.dto";
import { RoomDto } from "../rooms/dto/room.dto";
import { SearchHistoryDto } from "./dto/searchhistorydto";
import { JwtAuthGuard } from "./../../auth/jwt-auth.guard";
import { AuthService, JWTPayload } from "./../../auth/auth.service";
import { createRealContext } from "../../../context";

@Controller("search")
export class SearchController {
	constructor(
		private readonly searchService: SearchService,
		private readonly auth: AuthService,
	) {}

	@UseGuards(JwtAuthGuard)
	@Get()
	@ApiTags("search")
	@ApiOperation({ summary: "Search for rooms and users" })
	@ApiOkResponse({
		description: "Search results as an array of mixed UserDto and RoomDto.",
		type: CombinedSearchResults,
	})
	@ApiBadRequestResponse({ description: "Invalid query parameters" })
	@ApiQuery({
		name: "q",
		required: true,
		description: "A room name / username",
		type: "string",
	})
	@ApiQuery({
		name: "creator",
		required: false,
		description: "A room creator's profile name or username",
		type: "string",
	})
	async combinedSearch(
		@Query("q") q: string,
		@Request() req: any,
		@Query("creator") creator?: string,
	): Promise<CombinedSearchResults> {
		const query_params = {
			q,
			creator,
		};
		const ctx = createRealContext();
		const result = await this.searchService.combinedSearch(query_params, ctx);
		const userInfo: JWTPayload = this.auth.getUserInfo(req);
		this.searchService.insertSearchHistory(
			"/search",
			query_params,
			userInfo.id,
			ctx,
		);

		return result;
	}

	/* ************************************************** */
	@UseGuards(JwtAuthGuard)
	@Get("rooms")
	@ApiTags("search")
	@ApiOperation({ summary: "Search for rooms" })
	@ApiOkResponse({
		description: "Search results as an array of RoomDto.",
	})
	@ApiBadRequestResponse({ description: "Invalid query parameters" })
	@ApiQuery({
		name: "q",
		required: true,
		description: "A room name",
		type: "string",
	})
	@ApiQuery({
		name: "creator",
		required: false,
		description: "A room creator's profile name / username",
		type: "string",
	})
	async searchRooms(
		@Query("q") q: string,
		@Request() req: any,
		@Query("creator") creator?: string,
	): Promise<RoomDto[]> {
		const query_params = {
			q,
			creator,
		};
		const ctx = createRealContext();
		const result = await this.searchService.searchRooms(query_params, ctx);
		const userInfo: JWTPayload = this.auth.getUserInfo(req);
		console.log("Result" + typeof result);

		this.searchService.insertSearchHistory(
			"/search/rooms",
			query_params,
			userInfo.id,
			ctx,
		);

		return result;
	}

	/* ************************************************** */

	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard)
	@Get("history")
	@ApiTags("search")
	@ApiOperation({
		summary: "Get search history (including objects discovered from search)",
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
	@UseGuards(JwtAuthGuard)
	@Delete("history")
	@ApiTags("search")
	@ApiOperation({ summary: "Clear search history" })
	@ApiOkResponse({ description: "Search history cleared" })
	async clearSearchHistory(@Request() req: Request): Promise<void> {
		const userInfo: JWTPayload = this.auth.getUserInfo(req);
		await this.searchService.clearSearchHistory(userInfo.id);
	}

	/* ************************************************** */

	@Get("rooms/advanced")
	@ApiTags("search")
	@ApiOperation({ summary: "Advanced search for rooms" })
	@ApiOkResponse({
		description: "Search results as an array of RoomDto.",
		type: [RoomDto],
	})
	@ApiBadRequestResponse({ description: "Invalid query parameters" })
	@ApiQuery({
		name: "q",
		required: true,
		description: "A room name",
		type: "string",
	})
	@ApiQuery({
		name: "creator_username",
		required: false,
		description: "A room creator's username",
		type: "string",
	})
	@ApiQuery({
		name: "creator_name",
		required: false,
		description: "A room creator's profile name",
		type: "string",
	})
	@ApiQuery({
		name: "participant_count",
		required: false,
		description: "Minimum number of participants",
		type: "number",
	})
	@ApiQuery({
		name: "description",
		required: false,
		description: "A string to find in the room description",
		type: "string",
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
		type: "string",
	})
	@ApiQuery({
		name: "end_date",
		required: false,
		description: "Only if scheduled, the end date",
		type: "string",
	})
	@ApiQuery({
		name: "lang",
		required: false,
		description: "The room language (as a ISO 639-1 code)",
		type: "string",
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
		description: "An array of tags to compare",
		type: "array",
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
		const ctx = createRealContext();
		return await this.searchService.advancedSearchRooms(query_params, ctx);
	}

	/* ************************************************** */

	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard)
	@Get("rooms/history")
	@ApiTags("search")
	@ApiOperation({ summary: "Get recently searched rooms" })
	@ApiOkResponse({
		description: "Recently searched rooms as an array of SearchHistoryDto.",
		type: [SearchHistoryDto],
	})
	@ApiBadRequestResponse({ description: "Invalid query parameters" })
	async searchRoomsHistory(
		@Request() req: Request,
	): Promise<SearchHistoryDto[]> {
		const userInfo: JWTPayload = this.auth.getUserInfo(req);
		const ctx = createRealContext();
		return await this.searchService.searchRoomsHistory(userInfo.id, ctx);
	}

	/* ************************************************** */

	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard)
	@Delete("rooms/history")
	@ApiTags("search")
	@ApiOperation({ summary: "Clear room search history" })
	@ApiOkResponse({ description: "Room search history cleared" })
	async clearRoomsHistory(@Request() req: Request): Promise<void> {
		const userInfo: JWTPayload = this.auth.getUserInfo(req);
		await this.searchService.clearRoomsHistory(userInfo.id);
	}

	/* ************************************************** */

	@UseGuards(JwtAuthGuard)
	@Get("users")
	@ApiTags("search")
	@ApiOperation({ summary: "Search for users" })
	@ApiOkResponse({
		description: "Search results as an array of UserDto.",
		type: [UserDto],
	})
	@ApiBadRequestResponse({ description: "Invalid query parameters" })
	@ApiQuery({
		name: "q",
		required: true,
		description: "A username or profile name",
		type: "string",
	})
	async searchUsers(
		@Query("q") q: string,
		@Request() req: any,
	): Promise<UserDto[]> {
		const ctx = createRealContext();
		const result = await this.searchService.searchUsers(q, ctx);
		const userInfo: JWTPayload = this.auth.getUserInfo(req);

		this.searchService.insertSearchHistory(
			"/search/users",
			{ q: q },
			userInfo.id,
			ctx,
		);

		return result;
	}

	/* ************************************************** */

	@Get("users/advanced")
	@ApiTags("search")
	@ApiOperation({ summary: "Advanced search for users" })
	@ApiOkResponse({
		description: "Search results as an array of UserDto.",
		type: [UserDto],
	})
	@ApiBadRequestResponse({ description: "Invalid query parameters" })
	@ApiQuery({
		name: "q",
		required: true,
		description: "A username or profile name",
		type: "string",
	})
	@ApiQuery({
		name: "creator_username",
		required: false,
		description: "A user's username",
		type: "string",
	})
	@ApiQuery({
		name: "creator_name",
		required: false,
		description: "A user's profile name",
		type: "string",
	})
	@ApiQuery({
		name: "following",
		required: false,
		description: "Minimum number of following",
		type: "number",
	})
	@ApiQuery({
		name: "followers",
		required: false,
		description: "Minimum number of followers",
		type: "number",
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
		const ctx = createRealContext();
		return await this.searchService.advancedSearchUsers(query_params, ctx);
	}

	/* ************************************************** */

	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard)
	@Get("users/history")
	@ApiTags("search")
	@ApiOperation({ summary: "Get recently searched users" })
	@ApiOkResponse({
		description: "Recently searched users as an array of SearchHistoryDto.",
		type: [SearchHistoryDto],
	})
	@ApiBadRequestResponse({ description: "Invalid query parameters" })
	async searchUsersHistory(
		@Request() req: Request,
	): Promise<SearchHistoryDto[]> {
		const userInfo: JWTPayload = this.auth.getUserInfo(req);
		const ctx = createRealContext();
		return await this.searchService.searchUsersHistory(userInfo.id, ctx);
	}

	/* ************************************************** */

	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard)
	@Delete("users/history")
	@ApiTags("search")
	@ApiOperation({ summary: "Clear user search history" })
	@ApiOkResponse({ description: "User search history cleared" })
	async clearUsersHistory(@Request() req: Request): Promise<void> {
		const userInfo: JWTPayload = this.auth.getUserInfo(req);
		await this.searchService.clearUsersHistory(userInfo.id);
	}

	/* ************************************************** */
	/*
	@Get("genres")
	@ApiTags("search")
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
		type: "string",
	})
	async searchGenres(@Query("q") q: string): Promise<string[]> {
		return await this.searchService.searchGenres(q);
	}
		*/
}
