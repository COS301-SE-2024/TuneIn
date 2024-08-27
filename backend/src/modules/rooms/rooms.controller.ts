import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
	Put,
	UseGuards,
	Request,
} from "@nestjs/common";
import {
	ApiBadRequestResponse,
	ApiBearerAuth,
	ApiBody,
	ApiHeader,
	ApiNotFoundResponse,
	ApiOkResponse,
	ApiOperation,
	ApiParam,
	ApiSecurity,
	ApiTags,
	ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { SongInfoDto } from "./dto/songinfo.dto";
import { RoomsService } from "./rooms.service";
import { UpdateRoomDto } from "./dto/updateroomdto";
import { RoomDto } from "./dto/room.dto";
import { UserDto } from "../users/dto/user.dto";
import { JwtAuthGuard } from "./../../auth/jwt-auth.guard";
import { AuthService, JWTPayload } from "../../auth/auth.service";
import { LiveChatMessageDto } from "../../live/dto/livechatmessage.dto";
import { DtoGenService } from "../dto-gen/dto-gen.service";
import {
	RoomAnalyticsQueueDto,
	RoomAnalyticsParticipationDto,
	RoomAnalyticsInteractionsDto,
	RoomAnalyticsVotesDto,
	RoomAnalyticsSongsDto,
	RoomAnalyticsContributorsDto,
	RoomAnalyticsDto,
	RoomAnalyticsKeyMetricsDto,
} from "./dto/roomanalytics.dto";

@Controller("rooms")
export class RoomsController {
	constructor(
		private readonly roomsService: RoomsService,
		private readonly auth: AuthService,
		private readonly dtogen: DtoGenService,
	) {}

	@Get("new")
	@ApiTags("rooms")
	@ApiOperation({ summary: "Get newly created public rooms" })
	@ApiParam({ name: "none" })
	@ApiOkResponse({
		description: "The new public rooms as an array of RoomDto.",
		type: RoomDto,
		isArray: true,
	})
	async getNewRooms(): Promise<RoomDto[]> {
		console.log("getting new rooms");
		return await this.roomsService.getNewRooms();
	}

	@ApiBearerAuth()
	@ApiSecurity("bearer")
	@UseGuards(JwtAuthGuard)
	@ApiHeader({
		name: "Authorization",
		description: "Bearer token for authentication",
	})
	@Get(":roomID")
	@ApiTags("rooms")
	@ApiOkResponse({
		description: "The room info as a RoomDto.",
		type: RoomDto,
	})
	@ApiParam({
		name: "roomID",
		description: "The ID of the room to get info for.",
		required: true,
		type: String,
		format: "uuid",
		example: "123e4567-e89b-12d3-a456-426614174000",
		allowEmptyValue: false,
	})
	@ApiBadRequestResponse({
		description: "Room not found.",
		type: RoomDto,
	})
	// generate summary
	@ApiOperation({ summary: "Get room info" })
	async getRoomInfo(
		@Request() req: any,
		@Param("roomID") roomID: string,
	): Promise<RoomDto> {
		console.log("getting room with ID", roomID);
		return await this.roomsService.getRoomInfo(roomID);
	}

	@ApiBearerAuth()
	@ApiSecurity("bearer")
	@UseGuards(JwtAuthGuard)
	@ApiHeader({
		name: "Authorization",
		description: "Bearer token for authentication",
	})
	@Patch(":roomID")
	@ApiTags("rooms")
	@ApiOkResponse({
		description: "Room info updated successfully.",
		type: RoomDto,
	})
	@ApiNotFoundResponse({
		description: "Room not found.",
	})
	@ApiParam({
		name: "roomID",
		description: "The ID of the room to update.",
		required: true,
		type: String,
		format: "uuid",
		example: "123e4567-e89b-12d3-a456-426614174000",
		allowEmptyValue: false,
	})
	@ApiBody({
		type: UpdateRoomDto,
		required: true,
		description: "The updated room info",
	})
	@ApiOperation({ summary: "Update room info" })
	async updateRoomInfo(
		@Request() req: any,
		@Param("roomID") roomID: string,
		@Body() updateRoomDto: UpdateRoomDto,
	): Promise<RoomDto> {
		console.log("updating room with ID", roomID, "with data", updateRoomDto);
		return await this.roomsService.updateRoomInfo(roomID, updateRoomDto);
	}

	@ApiBearerAuth()
	@ApiSecurity("bearer")
	@UseGuards(JwtAuthGuard)
	@ApiHeader({
		name: "Authorization",
		description: "Bearer token for authentication",
	})
	@Put(":roomID")
	@ApiTags("rooms")
	@ApiParam({
		name: "roomID",
		description: "The ID of the room to update.",
		required: true,
		type: String,
		format: "uuid",
		example: "123e4567-e89b-12d3-a456-426614174000",
		allowEmptyValue: false,
	})
	@ApiBody({
		type: UpdateRoomDto,
		required: true,
		description: "The updated room info",
	})
	async updateRoom(
		@Request() req: any,
		@Param("roomID") roomID: string,
		@Body() updateRoomDto: UpdateRoomDto,
	): Promise<RoomDto> {
		return await this.roomsService.updateRoomInfo(roomID, updateRoomDto);
	}

	@ApiBearerAuth()
	@ApiSecurity("bearer")
	@UseGuards(JwtAuthGuard)
	@ApiHeader({
		name: "Authorization",
		description: "Bearer token for authentication",
	})
	@Delete(":roomID")
	@ApiTags("rooms")
	@ApiOkResponse({
		description: "Room deleted successfully.",
		type: Boolean,
	})
	@ApiBadRequestResponse({
		description: "User is not the creator of the room.",
		type: Boolean,
	})
	@ApiParam({
		name: "roomID",
		description: "The ID of the room to delete.",
		required: true,
		type: String,
		format: "uuid",
		example: "123e4567-e89b-12d3-a456-426614174000",
		allowEmptyValue: false,
	})
	@ApiOperation({ summary: "Delete a room" })
	async deleteRoom(
		@Request() req: any,
		@Param("roomID") roomID: string,
	): Promise<boolean> {
		// check using jwt token whether the user is the creator of the room
		// if not, return 403
		// if yes, delete the room and return 200
		const userInfo: JWTPayload = this.auth.getUserInfo(req);
		return await this.roomsService.deleteRoom(roomID, userInfo.id);
	}

	/*
    POST /rooms/{roomID}/join
    adds current user as a participant to the room
    no input
    response: (2xx for success, 4xx for error)
    */
	@ApiBearerAuth()
	@ApiSecurity("bearer")
	@UseGuards(JwtAuthGuard)
	@ApiHeader({
		name: "Authorization",
		description: "Bearer token for authentication",
	})
	@Post(":roomID/join")
	@ApiTags("rooms")
	@ApiOkResponse({
		description: "User joined room successfully.",
		type: Boolean,
	})
	@ApiOperation({ summary: "Join a room" })
	@ApiBadRequestResponse({
		description: "User already in room.",
		type: Boolean,
	})
	@ApiParam({
		name: "roomID",
		description: "The ID of the room to join.",
		required: true,
		type: String,
		format: "uuid",
		example: "123e4567-e89b-12d3-a456-426614174000",
		allowEmptyValue: false,
	})
	async joinRoom(
		@Request() req: any,
		@Param("roomID") roomID: string,
	): Promise<boolean> {
		const userID: JWTPayload = this.auth.getUserInfo(req);
		return await this.roomsService.joinRoom(roomID, userID.id);
	}

	/*
    POST /rooms/{roomID}/leave
    remove current user as a participant to the room
    no input
    response: (2xx for success, 4xx for error)
    */
	@ApiBearerAuth()
	@ApiSecurity("bearer")
	@UseGuards(JwtAuthGuard)
	@ApiHeader({
		name: "Authorization",
		description: "Bearer token for authentication",
	})
	@Post(":roomID/leave")
	@ApiTags("rooms")
	@ApiOkResponse({
		description: "User left room successfully.",
		type: Boolean,
	})
	@ApiOperation({ summary: "Leave a room" })
	@ApiBadRequestResponse({
		description: "User not in room.",
		type: Boolean,
	})
	@ApiParam({
		name: "roomID",
		description: "The ID of the room to leave.",
		required: true,
		type: String,
		format: "uuid",
		example: "123e4567-e89b-12d3-a456-426614174000",
		allowEmptyValue: false,
	})
	async leaveRoom(
		@Request() req: any,
		@Param("roomID") roomID: string,
	): Promise<boolean> {
		const userID: JWTPayload = this.auth.getUserInfo(req);
		return await this.roomsService.leaveRoom(roomID, userID.id);
	}

	/*
    GET /rooms/{roomID}/users
    returns people currently (and previously in room)
    no input
    response: array of UserDto
    */
	@Get(":roomID/users")
	@ApiTags("rooms")
	@ApiOkResponse({
		description: "The users in the room as an array of UserDto.",
		type: UserDto,
		isArray: true,
	})
	@ApiOperation({ summary: "Get users in a room" })
	@ApiParam({
		name: "roomID",
		description: "The ID of the room to get users for.",
		required: true,
		type: String,
		format: "uuid",
		example: "123e4567-e89b-12d3-a456-426614174000",
		allowEmptyValue: false,
	})
	async getRoomUsers(
		@Request() req: any,
		@Param("roomID") roomID: string,
	): Promise<UserDto[]> {
		return await this.roomsService.getRoomUsers(roomID);
	}

	/*
    GET /rooms/{roomID}/songs
    returns the queue
    no input
    response: array of SongInfoDto
    */
	@Get(":roomID/songs")
	@ApiTags("rooms")
	@ApiOperation({ summary: "Get the queue of a room" })
	@ApiOkResponse({
		description: "The queue of the room as an array of SongInfoDto.",
	})
	@ApiNotFoundResponse({
		description: "Room not found",
	})
	@ApiUnauthorizedResponse({
		description: "Unauthorized",
	})
	@ApiParam({
		name: "roomID",
		description: "The ID of the room to get the queue for.",
		required: true,
		type: String,
		format: "uuid",
		example: "123e4567-e89b-12d3-a456-426614174000",
		allowEmptyValue: false,
	})
	async getRoomQueue(
		@Request() req: any,
		@Param("roomID") roomID: string,
		//): SongInfoDto[] {
	): Promise<string> {
		//const userInfo: JWTPayload = this.auth.getUserInfo(req);
		//return this.roomsService.getRoomQueue(roomID);
		return this.roomsService.getRoomQueueDUMBVERSION(roomID);
	}

	/*
    DELETE /rooms/{roomID}/songs
    clears the queue (except for current song, if playing)
    no input
    response: (2xx for success, 4xx for error)
    */
	@ApiBearerAuth()
	@ApiSecurity("bearer")
	@UseGuards(JwtAuthGuard)
	@ApiHeader({
		name: "Authorization",
		description: "Bearer token for authentication",
	})
	@Delete(":roomID/songs")
	@ApiTags("rooms")
	@ApiParam({
		name: "roomID",
		description: "The ID of the room to clear the queue for.",
		required: true,
		type: String,
		format: "uuid",
		example: "123e4567-e89b-12d3-a456-426614174000",
		allowEmptyValue: false,
	})
	clearRoomQueue(
		@Request() req: any,
		@Param("roomID") roomID: string,
	): boolean {
		return this.roomsService.clearRoomQueue(roomID);
	}

	/*
    POST /rooms/{roomID}/songs
    add a song to queue
    input: SongInfoDto
    response: array of SongInfoDto (room queue)
    */
	@ApiBearerAuth()
	@ApiSecurity("bearer")
	@UseGuards(JwtAuthGuard)
	@ApiHeader({
		name: "Authorization",
		description: "Bearer token for authentication",
	})
	@Post(":roomID/songs")
	@ApiTags("rooms")
	@ApiOperation({ summary: "Add a song to the queue of a room" })
	@ApiOkResponse({
		description: "The queue of the room as an array of SongInfoDto.",
	})
	@ApiNotFoundResponse({
		description: "Room not found",
	})
	@ApiUnauthorizedResponse({
		description: "Unauthorized",
	})
	@ApiParam({
		name: "roomID",
		description: "The ID of the room to add the song to.",
		required: true,
		type: String,
		format: "uuid",
		example: "123e4567-e89b-12d3-a456-426614174000",
		allowEmptyValue: false,
	})
	addSongToQueue(
		@Request() req: any,
		@Param("roomID") roomID: string,
		//@Body() songInfoDto: SongInfoDto,
		@Body() songInfoDto: string,
		//): SongInfoDto[] {
	): string {
		//return this.roomsService.addSongToQueue(roomID, songInfoDto);
		return this.roomsService.addSongToQueueDUMBVERSION(roomID, songInfoDto);
	}

	/*
    GET /rooms/{roomID}/songs/current
    returns the current playing song
    no input
    response: SongInfoDto
    */
	@Get(":roomID/songs/current")
	@ApiTags("rooms")
	@ApiParam({
		name: "roomID",
		description: "The ID of the room to get the current song for.",
		required: true,
		type: String,
		format: "uuid",
		example: "123e4567-e89b-12d3-a456-426614174000",
		allowEmptyValue: false,
	})
	getCurrentSong(
		@Request() req: any,
		@Param("roomID") roomID: string,
	): SongInfoDto {
		return this.roomsService.getCurrentSong(roomID);
	}

	@ApiBearerAuth()
	@ApiSecurity("bearer")
	@UseGuards(JwtAuthGuard)
	@ApiHeader({
		name: "Authorization",
		description: "Bearer token for authentication",
	})
	@Get(":roomID/chat/history")
	@ApiTags("rooms")
	@ApiOperation({ summary: "Get room's chat history" })
	@ApiParam({
		name: "roomID",
		description: "The ID of the room to get the chat history for.",
		required: true,
		type: String,
		format: "uuid",
		example: "123e4567-e89b-12d3-a456-426614174000",
		allowEmptyValue: false,
	})
	@ApiOkResponse({
		description: "The chat history as an array of LiveChatMessageDto.",
		type: LiveChatMessageDto,
		isArray: true,
	})
	async getLiveChatHistory(
		@Request() req: any,
		@Param("roomID") roomID: string,
	): Promise<LiveChatMessageDto[]> {
		return await this.roomsService.getLiveChatHistoryDto(roomID);
	}

	@ApiBearerAuth()
	@ApiSecurity("bearer")
	@UseGuards(JwtAuthGuard)
	@ApiHeader({
		name: "Authorization",
		description: "Bearer token for authentication",
	})
	@Post(":roomID/bookmark")
	@ApiTags("rooms")
	@ApiOperation({ summary: "Bookmark a room" })
	@ApiParam({
		name: "roomID",
		description: "The ID of the room to bookmark.",
		required: true,
		type: String,
		format: "uuid",
		example: "123e4567-e89b-12d3-a456-426614174000",
		allowEmptyValue: false,
	})
	@ApiOkResponse({
		description: "Room bookmarked successfully",
	})
	@ApiNotFoundResponse({
		description: "Room not found",
	})
	@ApiUnauthorizedResponse({
		description: "Unauthorized",
	})
	async bookmarkRoom(
		@Request() req: any,
		@Param("roomID") roomID: string,
	): Promise<void> {
		const userInfo: JWTPayload = this.auth.getUserInfo(req);
		await this.roomsService.bookmarkRoom(roomID, userInfo.id);
	}

	@ApiBearerAuth()
	@ApiSecurity("bearer")
	@UseGuards(JwtAuthGuard)
	@ApiHeader({
		name: "Authorization",
		description: "Bearer token for authentication",
	})
	@Post(":roomID/unbookmark")
	@ApiTags("rooms")
	@ApiOperation({ summary: "Unbookmark a room" })
	@ApiParam({
		name: "roomID",
		description: "The ID of the room to unbookmark.",
		required: true,
		type: String,
		format: "uuid",
		example: "123e4567-e89b-12d3-a456-426614174000",
		allowEmptyValue: false,
	})
	@ApiOkResponse({
		description: "Room unbookmarked successfully",
	})
	@ApiNotFoundResponse({
		description: "Room not found",
	})
	@ApiUnauthorizedResponse({
		description: "Unauthorized",
	})
	async unbookmarkRoom(
		@Request() req: any,
		@Param("roomID") roomID: string,
	): Promise<void> {
		const userInfo: JWTPayload = this.auth.getUserInfo(req);
		await this.roomsService.unbookmarkRoom(roomID, userInfo.id);
	}

	@ApiBearerAuth()
	@ApiSecurity("bearer")
	@UseGuards(JwtAuthGuard)
	@ApiHeader({
		name: "Authorization",
		description: "Bearer token for authentication",
	})
	@Get(":roomID/analytics")
	@ApiTags("room analytics")
	@ApiOperation({ summary: "Get room analytics" })
	@ApiParam({
		name: "roomID",
		description: "The ID of the room to get analytics for.",
		required: true,
		type: String,
		format: "uuid",
		example: "123e4567-e89b-12d3-a456-426614174000",
		allowEmptyValue: false,
	})
	@ApiOkResponse({
		description: "The analytics of the room as a RoomAnalyticsDto.",
	})
	@ApiUnauthorizedResponse({
		description: "Unauthorized",
	})
	async getRoomAnalytics(
		@Request() req: any,
		@Param("roomID") roomID: string,
	): Promise<RoomAnalyticsDto> {
		const userInfo: JWTPayload = this.auth.getUserInfo(req);
		return this.roomsService.getRoomAnalytics(roomID, userInfo.id);
	}

	@ApiBearerAuth()
	@ApiSecurity("bearer")
	@UseGuards(JwtAuthGuard)
	@ApiHeader({
		name: "Authorization",
		description: "Bearer token for authentication",
	})
	@Get(":roomID/analytics/queue")
	@ApiTags("room analytics")
	@ApiOperation({ summary: "Get room queue analytics" })
	@ApiParam({
		name: "roomID",
		description: "The ID of the room to get queue analytics for.",
		required: true,
		type: String,
		format: "uuid",
		example: "123e4567-e89b-12d3-a456-426614174000",
		allowEmptyValue: false,
	})
	@ApiOkResponse({
		description: "The queue analytics of the room as a RoomAnalyticsQueueDto.",
	})
	@ApiUnauthorizedResponse({
		description: "Unauthorized",
	})
	async getRoomQueueAnalytics(
		@Request() req: any,
		@Param("roomID") roomID: string,
	): Promise<RoomAnalyticsQueueDto> {
		const userInfo: JWTPayload = this.auth.getUserInfo(req);
		return this.roomsService.getRoomQueueAnalytics(roomID, userInfo.id);
	}

	@ApiBearerAuth()
	@ApiSecurity("bearer")
	@UseGuards(JwtAuthGuard)
	@ApiHeader({
		name: "Authorization",
		description: "Bearer token for authentication",
	})
	@Get(":roomID/analytics/participation")
	@ApiTags("room analytics")
	@ApiOperation({ summary: "Get room participation analytics" })
	@ApiParam({
		name: "roomID",
		description: "The ID of the room to get participation analytics for.",
		required: true,
		type: String,
		format: "uuid",
		example: "123e4567-e89b-12d3-a456-426614174000",
		allowEmptyValue: false,
	})
	@ApiOkResponse({
		description:
			"The participation analytics of the room as a RoomAnalyticsParticipationDto.",
	})
	@ApiUnauthorizedResponse({
		description: "Unauthorized",
	})
	async getRoomParticipationAnalytics(
		@Request() req: any,
		@Param("roomID") roomID: string,
	): Promise<RoomAnalyticsParticipationDto> {
		const userInfo: JWTPayload = this.auth.getUserInfo(req);
		return this.roomsService.getRoomParticipationAnalytics(roomID, userInfo.id);
	}

	@ApiBearerAuth()
	@ApiSecurity("bearer")
	@UseGuards(JwtAuthGuard)
	@ApiHeader({
		name: "Authorization",
		description: "Bearer token for authentication",
	})
	@Get(":roomID/analytics/interactions")
	@ApiTags("room analytics")
	@ApiOperation({ summary: "Get room interaction analytics" })
	@ApiParam({
		name: "roomID",
		description: "The ID of the room to get interaction analytics for.",
		required: true,
		type: String,
		format: "uuid",
		example: "123e4567-e89b-12d3-a456-426614174000",
		allowEmptyValue: false,
	})
	@ApiOkResponse({
		description:
			"The interaction analytics of the room as a RoomAnalyticsInteractionsDto.",
	})
	@ApiUnauthorizedResponse({
		description: "Unauthorized",
	})
	async getRoomInteractionAnalytics(
		@Request() req: any,
		@Param("roomID") roomID: string,
	): Promise<RoomAnalyticsInteractionsDto> {
		const userInfo: JWTPayload = this.auth.getUserInfo(req);
		return this.roomsService.getRoomInteractionAnalytics(roomID, userInfo.id);
	}

	@ApiBearerAuth()
	@ApiSecurity("bearer")
	@UseGuards(JwtAuthGuard)
	@ApiHeader({
		name: "Authorization",
		description: "Bearer token for authentication",
	})
	@Get(":roomID/analytics/votes")
	@ApiTags("room analytics")
	@ApiOperation({ summary: "Get room voting analytics" })
	@ApiParam({
		name: "roomID",
		description: "The ID of the room to get voting analytics for.",
		required: true,
		type: String,
		format: "uuid",
		example: "123e4567-e89b-12d3-a456-426614174000",
		allowEmptyValue: false,
	})
	@ApiOkResponse({
		description: "The voting analytics of the room as a RoomAnalyticsVotesDto.",
	})
	@ApiUnauthorizedResponse({
		description: "Unauthorized",
	})
	async getRoomVotesAnalytics(
		@Request() req: any,
		@Param("roomID") roomID: string,
	): Promise<RoomAnalyticsVotesDto> {
		const userInfo: JWTPayload = this.auth.getUserInfo(req);
		return this.roomsService.getRoomVotesAnalytics(roomID, userInfo.id);
	}

	@ApiBearerAuth()
	@ApiSecurity("bearer")
	@UseGuards(JwtAuthGuard)
	@ApiHeader({
		name: "Authorization",
		description: "Bearer token for authentication",
	})
	@Get(":roomID/analytics/songs")
	@ApiTags("room analytics")
	@ApiOperation({ summary: "Get room song analytics" })
	@ApiParam({
		name: "roomID",
		description: "The ID of the room to get song analytics for.",
		required: true,
		type: String,
		format: "uuid",
		example: "123e4567-e89b-12d3-a456-426614174000",
		allowEmptyValue: false,
	})
	@ApiOkResponse({
		description: "The song analytics of the room as a RoomAnalyticsSongsDto.",
	})
	@ApiUnauthorizedResponse({
		description: "Unauthorized",
	})
	async getRoomSongsAnalytics(
		@Request() req: any,
		@Param("roomID") roomID: string,
	): Promise<RoomAnalyticsSongsDto> {
		const userInfo: JWTPayload = this.auth.getUserInfo(req);
		return this.roomsService.getRoomSongsAnalytics(roomID, userInfo.id);
	}

	@ApiBearerAuth()
	@ApiSecurity("bearer")
	@UseGuards(JwtAuthGuard)
	@ApiHeader({
		name: "Authorization",
		description: "Bearer token for authentication",
	})
	@Get(":roomID/analytics/contributors")
	@ApiTags("room analytics")
	@ApiOperation({ summary: "Get room contributor analytics" })
	@ApiParam({
		name: "roomID",
		description: "The ID of the room to get contributor analytics for.",
		required: true,
		type: String,
		format: "uuid",
		example: "123e4567-e89b-12d3-a456-426614174000",
		allowEmptyValue: false,
	})
	@ApiOkResponse({
		description:
			"The contributor analytics of the room as a RoomAnalyticsContributorsDto.",
	})
	@ApiUnauthorizedResponse({
		description: "Unauthorized",
	})
	async getRoomContributorsAnalytics(
		@Request() req: any,
		@Param("roomID") roomID: string,
	): Promise<RoomAnalyticsContributorsDto> {
		const userInfo: JWTPayload = this.auth.getUserInfo(req);
		return this.roomsService.getRoomContributorsAnalytics(roomID, userInfo.id);
	}

	@ApiBearerAuth()
	@ApiSecurity("bearer")
	@UseGuards(JwtAuthGuard)
	@ApiHeader({
		name: "Authorization",
		description: "Bearer token for authentication",
	})
	@Get("analytics")
	@ApiTags("room analytics")
	@ApiOperation({ summary: "Get key metrics for user's rooms" })
	@ApiOkResponse({
		description:
			"The key metrics for the user's rooms as a RoomAnalyticsKeyMetricsDto.",
	})
	@ApiUnauthorizedResponse({
		description: "Unauthorized",
	})
	async getKeyMetrics(
		@Request() req: any,
	): Promise<RoomAnalyticsKeyMetricsDto> {
		const userInfo: JWTPayload = this.auth.getUserInfo(req);
		return this.roomsService.getKeyMetrics(userInfo.id);
	}

	// define an endpoint for room song archival
	@ApiBearerAuth()
	@ApiSecurity("bearer")
	@UseGuards(JwtAuthGuard)
	@ApiHeader({
		name: "Authorization",
		description: "Bearer token for authentication",
	})
	@Post(":roomID/archive/playlist")
	@ApiTags("rooms")
	@ApiOperation({ summary: "Archive a room's songs" })
	@ApiParam({
		name: "roomID",
		description: "The ID of the room to archive songs for.",
		required: true,
		type: String,
		format: "uuid",
		example: "123e4567-e89b-12d3-a456-426614174000",
		allowEmptyValue: false,
	})
	@ApiOkResponse({
		description: "Room songs archived successfully",
	})
	@ApiNotFoundResponse({
		description: "Room not found",
	})
	@ApiUnauthorizedResponse({
		description: "Unauthorized",
	})
	async archiveRoomSongs(
		@Request() req: any,
		@Param("roomID") roomID: string,
		// define the body of the request as a json with playlist name and description
		@Body()
		archiveInfo: {
			name: string;
			description: string;
		},
	): Promise<void> {
		const userInfo: JWTPayload = this.auth.getUserInfo(req);
		await this.roomsService.archiveRoomSongs(roomID, userInfo.id, archiveInfo);
	}

	@ApiBearerAuth()
	@ApiSecurity("bearer")
	@UseGuards(JwtAuthGuard)
	@ApiHeader({
		name: "Authorization",
		description: "Bearer token for authentication",
	})
	@Get("archive/playlist")
	@ApiTags("rooms")
	@ApiOperation({ summary: "Get a user's archived songs" })
	@ApiOkResponse({
		description: "User's archived songs retrieved successfully",
		isArray: true,
	})
	@ApiUnauthorizedResponse({
		description: "Unauthorized",
	})
	async getArchivedSongs(@Request() req: any): Promise<any> {
		console.log("getting archived songs");
		const userInfo: JWTPayload = this.auth.getUserInfo(req);
		return await this.roomsService.getArchivedSongs(userInfo.id);
	}

	// define an endpoint for deleting a user's archived songs based on playlist id
	@ApiBearerAuth()
	@ApiSecurity("bearer")
	@UseGuards(JwtAuthGuard)
	@ApiHeader({
		name: "Authorization",
		description: "Bearer token for authentication",
	})
	@Delete("archive/playlist/:playlistID")
	@ApiTags("rooms")
	@ApiOperation({ summary: "Delete a user's archived songs" })
	@ApiParam({ name: "playlistID" })
	@ApiOkResponse({
		description: "User's archived songs deleted successfully",
	})
	@ApiNotFoundResponse({
		description: "Playlist not found",
	})
	@ApiUnauthorizedResponse({
		description: "Unauthorized",
	})
	async deleteArchivedSongs(
		@Request() req: any,
		@Param("playlistID") playlistID: string,
	): Promise<void> {
		const userInfo: JWTPayload = this.auth.getUserInfo(req);
		await this.roomsService.deleteArchivedSongs(userInfo.id, playlistID);
	}
}
