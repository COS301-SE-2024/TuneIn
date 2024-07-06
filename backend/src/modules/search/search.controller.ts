import { Controller, Get } from "@nestjs/common";
import { SearchService, CombinedSearchResults } from "./search.service";
import {
	ApiBadRequestResponse,
	ApiOkResponse,
	ApiOperation,
	ApiQuery,
	ApiTags,
} from "@nestjs/swagger";
import { UserDto } from "../users/dto/user.dto";
import { RoomDto } from "../rooms/dto/room.dto";

@Controller("search")
export class SearchController {
	constructor(private readonly searchService: SearchService) {}

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
	async combinedSearch() {
		return await this.searchService.combinedSearch();
	}

	/* ************************************************** */

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
	async searchRooms() {
		return await this.searchService.searchRooms();
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
	async advancedSearchRooms() {
		return await this.searchService.advancedSearchRooms();
	}

	/* ************************************************** */

	@Get("rooms/history")
	@ApiTags("search")
	@ApiOperation({ summary: "Get recently searched rooms" })
	@ApiOkResponse({
		description: "Recently searched rooms as an array of RoomDto.",
		type: [RoomDto],
	})
	@ApiBadRequestResponse({ description: "Invalid query parameters" })
	async searchRoomsHistory() {
		return await this.searchService.searchRoomsHistory();
	}

	/* ************************************************** */

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
	async searchUsers() {
		return await this.searchService.searchUsers();
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
	async advancedSearchUsers() {
		return await this.searchService.advancedSearchUsers();
	}

	/* ************************************************** */

	@Get("users/history")
	@ApiTags("search")
	@ApiOperation({ summary: "Get recently searched users" })
	@ApiOkResponse({
		description: "Recently searched users as an array of UserDto.",
		type: [UserDto],
	})
	@ApiBadRequestResponse({ description: "Invalid query parameters" })
	async searchUsersHistory() {
		return await this.searchService.searchUsersHistory();
	}
}
