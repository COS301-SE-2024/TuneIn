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
	@ApiOperation({
		summary: "Get newly created public rooms",
		description: "Returns the new public rooms as an array of RoomDto.",
		operationId: "getNewRooms",
	})
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
	/*
	@ApiHeader({
		name: "Authorization",
		description: "Bearer token for authentication",
	})
	*/
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
	@ApiOperation({
		summary: "Get room info",
		description: "Returns the room info as a RoomDto.",
		operationId: "getRoomInfo",
	})
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
	/*
	@ApiHeader({
		name: "Authorization",
		description: "Bearer token for authentication",
	})
	*/
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
	@ApiOperation({
		summary: "Update room info",
		operationId: "updateRoomInfo",
	})
	async patchRoomInfo(
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
	/*
	@ApiHeader({
		name: "Authorization",
		description: "Bearer token for authentication",
	})
	*/
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
	@ApiOperation({
		summary: "Update room info",
		operationId: "putRoomInfo",
	})
	async putRoomInfo(
		@Request() req: any,
		@Param("roomID") roomID: string,
		@Body() updateRoomDto: UpdateRoomDto,
	): Promise<RoomDto> {
		return await this.roomsService.updateRoomInfo(roomID, updateRoomDto);
	}

	@ApiBearerAuth()
	@ApiSecurity("bearer")
	@UseGuards(JwtAuthGuard)
	/*
	@ApiHeader({
		name: "Authorization",
		description: "Bearer token for authentication",
	})
	*/
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
	@ApiOperation({
		summary: "Delete a room",
		operationId: "deleteRoom",
	})
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

	@ApiBearerAuth()
	@ApiSecurity("bearer")
	@UseGuards(JwtAuthGuard)
	/*
	@ApiHeader({
		name: "Authorization",
		description: "Bearer token for authentication",
	})
	*/
	@Post(":roomID/join")
	@ApiTags("rooms")
	@ApiOkResponse({
		description: "User joined room successfully.",
		type: Boolean,
	})
	@ApiOperation({
		summary: "Join a room",
		description: "Adds the current user as a participant to the room.",
		operationId: "joinRoom",
	})
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

	@ApiBearerAuth()
	@ApiSecurity("bearer")
	@UseGuards(JwtAuthGuard)
	/*
	@ApiHeader({
		name: "Authorization",
		description: "Bearer token for authentication",
	})
	*/
	@Post(":roomID/leave")
	@ApiTags("rooms")
	@ApiOkResponse({
		description: "User left room successfully.",
		type: Boolean,
	})
	@ApiOperation({
		summary: "Leave a room",
		description: "Removes the current user as a participant to the room.",
		operationId: "leaveRoom",
	})
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

	@Get(":roomID/users")
	@ApiTags("rooms")
	@ApiOkResponse({
		description: "The users in the room as an array of UserDto.",
		type: UserDto,
		isArray: true,
	})
	@ApiOperation({
		summary: "Get users in a room",
		description: "Returns the users in the room as an array of UserDto.",
		operationId: "getRoomUsers",
	})
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

	@Get(":roomID/songs")
	@ApiTags("rooms")
	@ApiOperation({
		summary: "Get the queue of a room",
		description: "Returns the queue of the room as an array of SongInfoDto.",
		operationId: "getRoomQueue",
	})
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

	@ApiBearerAuth()
	@ApiSecurity("bearer")
	@UseGuards(JwtAuthGuard)
	/*
	@ApiHeader({
		name: "Authorization",
		description: "Bearer token for authentication",
	})
	*/
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
	@ApiOperation({
		summary: "Clear the queue of a room",
		description: "Clears the queue of the room except for the current song.",
		operationId: "clearRoomQueue",
	})
	clearRoomQueue(
		@Request() req: any,
		@Param("roomID") roomID: string,
	): boolean {
		return this.roomsService.clearRoomQueue(roomID);
	}

	@ApiBearerAuth()
	@ApiSecurity("bearer")
	@UseGuards(JwtAuthGuard)
	/*
	@ApiHeader({
		name: "Authorization",
		description: "Bearer token for authentication",
	})
	*/
	@Post(":roomID/songs")
	@ApiTags("rooms")
	@ApiOperation({
		summary: "Add a song to the queue of a room",
		operationId: "addSongToQueue",
	})
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
	@ApiOperation({
		summary: "Get the current song of a room",
		description: "Get the song currently playing in the room.",
		operationId: "getCurrentSong",
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
	/*
	@ApiHeader({
		name: "Authorization",
		description: "Bearer token for authentication",
	})
	*/
	@Get(":roomID/chat/history")
	@ApiTags("rooms")
	@ApiOperation({
		summary: "Get the chat history of a room",
		description:
			"Returns the chat history of the room as an array of LiveChatMessageDto.",
		operationId: "getLiveChatHistory",
	})
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
	/*
	@ApiHeader({
		name: "Authorization",
		description: "Bearer token for authentication",
	})
	*/
	@Post(":roomID/bookmark")
	@ApiTags("rooms")
	@ApiOperation({
		summary: "Bookmark a room",
		description: "Adds the room to the user's bookmarks.",
		operationId: "bookmarkRoom",
	})
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
	/*
	@ApiHeader({
		name: "Authorization",
		description: "Bearer token for authentication",
	})
	*/
	@Post(":roomID/unbookmark")
	@ApiTags("rooms")
	@ApiOperation({
		summary: "Unbookmark a room",
		description: "Removes the room from the user's bookmarks.",
		operationId: "unbookmarkRoom",
	})
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
	/*
	@ApiHeader({
		name: "Authorization",
		description: "Bearer token for authentication",
	})
	*/
	@Get(":roomID/analytics")
	@ApiTags("room analytics")
	@ApiOperation({
		summary: "Get room analytics",
		description: "Returns the analytics of the room as a RoomAnalyticsDto.",
		operationId: "getRoomAnalytics",
	})
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
	/*
	@ApiHeader({
		name: "Authorization",
		description: "Bearer token for authentication",
	})
	*/
	@Get(":roomID/analytics/queue")
	@ApiTags("room analytics")
	@ApiOperation({
		summary: "Get room queue analytics",
		description:
			"Returns the queue analytics of the room as a RoomAnalyticsQueueDto.",
		operationId: "getRoomQueueAnalytics",
	})
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
	/*
	@ApiHeader({
		name: "Authorization",
		description: "Bearer token for authentication",
	})
	*/
	@Get(":roomID/analytics/participation")
	@ApiTags("room analytics")
	@ApiOperation({
		summary: "Get room participation analytics",
		description:
			"Returns the participation analytics of the room as a RoomAnalyticsParticipationDto.",
		operationId: "getRoomParticipationAnalytics",
	})
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
	/*
	@ApiHeader({
		name: "Authorization",
		description: "Bearer token for authentication",
	})
	*/
	@Get(":roomID/analytics/interactions")
	@ApiTags("room analytics")
	@ApiOperation({
		summary: "Get room interaction analytics",
		description:
			"Returns the interaction analytics of the room as a RoomAnalyticsInteractionsDto.",
		operationId: "getRoomInteractionAnalytics",
	})
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
	/*
	@ApiHeader({
		name: "Authorization",
		description: "Bearer token for authentication",
	})
	*/
	@Get(":roomID/analytics/votes")
	@ApiTags("room analytics")
	@ApiOperation({
		summary: "Get room voting analytics",
		description:
			"Returns the voting analytics of the room as a RoomAnalyticsVotesDto.",
		operationId: "getRoomVotesAnalytics",
	})
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
	/*
	@ApiHeader({
		name: "Authorization",
		description: "Bearer token for authentication",
	})
	*/
	@Get(":roomID/analytics/songs")
	@ApiTags("room analytics")
	@ApiOperation({
		summary: "Get room song analytics",
		description:
			"Returns the song analytics of the room as a RoomAnalyticsSongsDto.",
		operationId: "getRoomSongsAnalytics",
	})
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
	/*
	@ApiHeader({
		name: "Authorization",
		description: "Bearer token for authentication",
	})
	*/
	@Get(":roomID/analytics/contributors")
	@ApiTags("room analytics")
	@ApiOperation({
		summary: "Get room contributor analytics",
		description:
			"Returns the contributor analytics of the room as a RoomAnalyticsContributorsDto.",
		operationId: "getRoomContributorsAnalytics",
	})
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
	/*
	@ApiHeader({
		name: "Authorization",
		description: "Bearer token for authentication",
	})
	*/
	@Get("analytics")
	@ApiTags("room analytics")
	@ApiOperation({
		summary: "Get key metrics for user's rooms",
		description:
			"Returns the key metrics for the user's rooms as a RoomAnalyticsKeyMetricsDto.",
		operationId: "getKeyMetrics",
	})
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

	async getArchivedSongs(@Request() req: any): Promise<any> {
		console.log("getting archived songs");
		const userInfo: JWTPayload = this.auth.getUserInfo(req);
		return await this.roomsService.getArchivedSongs(userInfo.id);
	}

	// define an endpoint for deleting a user's archived songs based on playlist id
	async deleteArchivedSongs(
		@Request() req: any,
		@Param("playlistID") playlistID: string,
	): Promise<void> {
		const userInfo: JWTPayload = this.auth.getUserInfo(req);
		await this.roomsService.deleteArchivedSongs(userInfo.id, playlistID);
	}
}
