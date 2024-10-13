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
	ApiNotFoundResponse,
	ApiOkResponse,
	ApiOperation,
	ApiParam,
	ApiProduces,
	ApiSecurity,
	ApiTags,
	ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { SongInfoDto } from "./dto/songinfo.dto";
import { RoomsService, UserActionDto } from "./rooms.service";
import { UpdateRoomDto } from "./dto/updateroomdto";
import { RoomDto } from "./dto/room.dto";
import { UserDto } from "../users/dto/user.dto";
import { JwtAuthGuard } from "./../../auth/jwt-auth.guard";
import { AuthService, JWTPayload } from "../../auth/auth.service";
import { LiveChatMessageDto } from "../../live/dto/livechatmessage.dto";
import {
	RoomAnalyticsParticipationDto,
	RoomAnalyticsInteractionsDto,
	RoomAnalyticsKeyMetricsDto,
} from "./dto/roomanalytics.dto";
import { RoomAnalyticsService } from "./roomanalytics.service";

@Controller("rooms")
export class RoomsController {
	constructor(
		private readonly roomsService: RoomsService,
		private readonly roomAnalytics: RoomAnalyticsService,
		private readonly auth: AuthService,
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
	async getRoomInfo(@Param("roomID") roomID: string): Promise<RoomDto> {
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
		@Request() req: Request,
		@Param("roomID") roomID: string,
		@Body() updateRoomDto: UpdateRoomDto,
	): Promise<RoomDto> {
		console.log("updating room with ID", roomID, "with data", updateRoomDto);
		const userInfo: JWTPayload = this.auth.getUserInfo(req);
		return await this.roomsService.updateRoomInfo(
			userInfo.id,
			roomID,
			updateRoomDto,
		);
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
	@ApiOkResponse({
		description: "Room info updated successfully.",
		type: RoomDto,
	})
	async putRoomInfo(
		@Request() req: Request,
		@Param("roomID") roomID: string,
		@Body() updateRoomDto: UpdateRoomDto,
	): Promise<RoomDto> {
		const userInfo: JWTPayload = this.auth.getUserInfo(req);
		return await this.roomsService.updateRoomInfo(
			userInfo.id,
			roomID,
			updateRoomDto,
		);
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
	})
	@ApiBadRequestResponse({
		description: "User is not the creator of the room.",
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
		@Request() req: Request,
		@Param("roomID") roomID: string,
	): Promise<void> {
		// check using jwt token whether the user is the creator of the room
		// if not, return 403
		// if yes, delete the room and return 200
		const userInfo: JWTPayload = this.auth.getUserInfo(req);
		await this.roomsService.deleteRoom(roomID, userInfo.id);
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
		@Request() req: Request,
		@Param("roomID") roomID: string,
	): Promise<void> {
		const userID: JWTPayload = this.auth.getUserInfo(req);
		await this.roomsService.joinRoom(roomID, userID.id);
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
		@Request() req: Request,
		@Param("roomID") roomID: string,
	): Promise<void> {
		const userID: JWTPayload = this.auth.getUserInfo(req);
		await this.roomsService.leaveRoom(roomID, userID.id);
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
	async getRoomUsers(@Param("roomID") roomID: string): Promise<UserDto[]> {
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
		@Param("roomID") roomID: string,
		//): SongInfoDto[] {
	): Promise<SongInfoDto[]> {
		return this.roomsService.getRoomQueue(roomID);
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
	getCurrentSong(@Param("roomID") roomID: string): SongInfoDto {
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
		@Request() req: Request,
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
		@Request() req: Request,
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
		type: RoomAnalyticsParticipationDto,
	})
	@ApiUnauthorizedResponse({
		description: "Unauthorized",
	})
	async getRoomParticipationAnalytics(
		@Request() req: Request,
		@Param("roomID") roomID: string,
	): Promise<RoomAnalyticsParticipationDto> {
		const userInfo: JWTPayload = this.auth.getUserInfo(req);
		return this.roomAnalytics.getRoomParticipationAnalytics(
			roomID,
			userInfo.id,
		);
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
		type: RoomAnalyticsInteractionsDto,
	})
	@ApiUnauthorizedResponse({
		description: "Unauthorized",
	})
	async getRoomInteractionAnalytics(
		@Request() req: Request,
		@Param("roomID") roomID: string,
	): Promise<RoomAnalyticsInteractionsDto> {
		const userInfo: JWTPayload = this.auth.getUserInfo(req);
		return this.roomAnalytics.getRoomInteractionAnalytics(roomID, userInfo.id);
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
	@Get("analytics/:period/keymetrics")
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
		type: RoomAnalyticsKeyMetricsDto,
	})
	@ApiUnauthorizedResponse({
		description: "Unauthorized",
	})
	async getKeyMetrics(
		@Request() req: Request,
		@Param("period") period: string,
	): Promise<RoomAnalyticsKeyMetricsDto> {
		const userInfo: JWTPayload = this.auth.getUserInfo(req);
		return this.roomAnalytics.getKeyMetrics(userInfo.id, period);
	}

	@Get(":roomID/kicked")
	@ApiTags("room management")
	@ApiOperation({
		summary: "Get list of kicked users",
		description:
			"Returns an array of UserDto representing users who were been kicked from the room.",
		operationId: "getKickedUsers",
	})
	@ApiParam({
		name: "roomID",
		description: "The ID of the room to get the kicked users for.",
		required: true,
		type: String,
		format: "uuid",
		example: "123e4567-e89b-12d3-a456-426614174000",
		allowEmptyValue: false,
	})
	@ApiOkResponse({
		description:
			"An array of UserDto representing the kicked users in the room.",
		type: UserDto,
		isArray: true,
	})
	async getKickedUsers(@Param("roomID") roomID: string): Promise<UserDto[]> {
		return await this.roomsService.getKickedUsers(roomID);
	}

	@Post(":roomID/kicked")
	@ApiBearerAuth()
	@ApiSecurity("bearer")
	@UseGuards(JwtAuthGuard)
	/*
	@ApiHeader({
		name: "Authorization",
		description: "Bearer token for authentication",
	})
	*/
	@ApiTags("room management")
	@ApiOperation({
		summary: "Kick someone out of a room",
		description: "Kicks a user out of the room.",
		operationId: "kickUser",
	})
	@ApiParam({
		name: "roomID",
		description: "The ID of the room to kick the user from.",
		required: true,
		type: String,
		format: "uuid",
		example: "123e4567-e89b-12d3-a456-426614174000",
		allowEmptyValue: false,
	})
	@ApiBody({
		type: UserActionDto,
		description: "The user ID of the user to be kicked.",
		required: true,
	})
	@ApiOkResponse({
		description: "User kicked successfully",
	})
	@ApiBadRequestResponse({
		description: "Bad request",
	})
	async kickUser(
		@Request() req: Request,
		@Param("roomID") roomID: string,
		@Body() user: UserActionDto,
	): Promise<void> {
		const userInfo: JWTPayload = this.auth.getUserInfo(req);
		await this.roomsService.kickUser(roomID, userInfo.id, user.userID);
	}

	@Delete(":roomID/kicked")
	@ApiTags("room management")
	@ApiOperation({
		summary: "Undo participant kick",
		description: "Undoes the kick of a participant in the room.",
		operationId: "undoKick",
	})
	@ApiParam({
		name: "roomID",
		description: "The ID of the room to undo the kick in.",
		required: true,
		type: String,
		format: "uuid",
		example: "123e4567-e89b-12d3-a456-426614174000",
		allowEmptyValue: false,
	})
	@ApiBody({
		type: UserActionDto,
		description: "The user ID of the user to undo the kick for.",
		required: true,
	})
	@ApiOkResponse({
		description: "Kick undone successfully",
	})
	@ApiBadRequestResponse({
		description: "Bad request",
	})
	async undoKick(
		@Request() req: Request,
		@Param("roomID") roomID: string,
		@Body() user: UserActionDto,
	): Promise<void> {
		const userInfo: JWTPayload = this.auth.getUserInfo(req);
		await this.roomsService.undoKick(roomID, userInfo.id, user.userID);
	}

	@Get(":roomID/banned")
	@ApiTags("room management")
	@ApiOperation({
		summary: "Get list of banned users",
		description:
			"Returns an array of UserDto representing the banned users in the room.",
		operationId: "getBannedUsers",
	})
	@ApiParam({
		name: "roomID",
		description: "The ID of the room to get the banned users for.",
		required: true,
		type: String,
		format: "uuid",
		example: "123e4567-e89b-12d3-a456-426614174000",
		allowEmptyValue: false,
	})
	@ApiOkResponse({
		description:
			"An array of UserDto representing the banned users in the room.",
	})
	async getBannedUsers(@Param("roomID") roomID: string): Promise<UserDto[]> {
		return await this.roomsService.getBannedUsers(roomID);
	}

	@Post(":roomID/banned")
	@ApiTags("room management")
	@ApiOperation({
		summary: "Perma ban someone from a room",
		description: "Permanently bans a user from the room.",
		operationId: "banUser",
	})
	@ApiParam({
		name: "roomID",
		description: "The ID of the room to ban the user from.",
		required: true,
		type: String,
		format: "uuid",
		example: "123e4567-e89b-12d3-a456-426614174000",
		allowEmptyValue: false,
	})
	@ApiBody({
		type: UserActionDto,
		description: "The user ID of the user to be banned.",
		required: true,
	})
	@ApiOkResponse({
		description: "User banned successfully",
	})
	@ApiBadRequestResponse({
		description: "Bad request",
	})
	async banUser(
		@Request() req: Request,
		@Param("roomID") roomID: string,
		@Body() user: UserActionDto,
	): Promise<void> {
		const userInfo: JWTPayload = this.auth.getUserInfo(req);
		await this.roomsService.banUser(roomID, userInfo.id, user.userID);
	}

	@Delete(":roomID/banned")
	@ApiTags("room management")
	@ApiOperation({
		summary: "Undo participant ban",
		description: "Undoes the ban of a participant in the room.",
		operationId: "undoBan",
	})
	@ApiParam({
		name: "roomID",
		description: "The ID of the room to undo the ban in.",
		required: true,
		type: String,
		format: "uuid",
		example: "123e4567-e89b-12d3-a456-426614174000",
		allowEmptyValue: false,
	})
	@ApiBody({
		type: UserActionDto,
		description: "The user ID of the user to undo the ban for.",
		required: true,
	})
	@ApiOkResponse({
		description: "Ban undone successfully",
	})
	@ApiBadRequestResponse({
		description: "Bad request",
	})
	async undoBan(
		@Request() req: Request,
		@Param("roomID") roomID: string,
		@Body() user: UserActionDto,
	): Promise<void> {
		const userInfo: JWTPayload = this.auth.getUserInfo(req);
		await this.roomsService.undoBan(roomID, userInfo.id, user.userID);
	}

	@Get(":roomID/schedule")
	@ApiTags("rooms")
	@ApiOperation({
		summary: "Get scheduled room",
		description: "Returns the scheduled room as a .ics file.",
		operationId: "getCalendarFile",
	})
	@ApiParam({
		name: "roomID",
		description: "The ID of the room to get the schedule for.",
		required: true,
		type: String,
		format: "uuid",
		example: "123e4567-e89b-12d3-a456-426614174000",
		allowEmptyValue: false,
	})
	@ApiOkResponse({
		description: "The scheduled room as a .ics file.",
		type: File,
		content: {
			"application/octet-stream": {
				schema: {
					type: "string",
					format: "binary",
				},
			},
			"text/calendar": {
				schema: {
					type: "string",
					format: "binary",
				},
			},
		},
	})
	@ApiNotFoundResponse({
		description: "Room not found",
	})
	@ApiNotFoundResponse({
		description: "Room not scheduled",
	})
	@ApiProduces("application/octet-stream")
	@ApiProduces("text/calendar")
	async getScheduledRoom(@Param("roomID") roomID: string): Promise<File> {
		return await this.roomsService.getCalendarFile(roomID);
	}

	/**
	 * Save room as a playlist
	 *
	 * @param roomID - The ID of the room to save as a playlist.
	 * @returns The playlist ID as a string.
	 */
	@Post(":roomID/save")
	@ApiBearerAuth()
	@ApiSecurity("bearer")
	@UseGuards(JwtAuthGuard)
	/*
	@ApiHeader({
		name: "Authorization",
		description: "Bearer token for authentication",
	})
	*/
	@ApiTags("rooms")
	@ApiOperation({
		summary: "Save room as a playlist",
		operationId: "saveRoom",
	})
	@ApiParam({
		name: "roomID",
		description: "The ID of the room to save as a playlist.",
		required: true,
		type: String,
		format: "uuid",
		example: "123e4567-e89b-12d3-a456-426614174000",
		allowEmptyValue: false,
	})
	@ApiOkResponse({
		description: "The playlist ID as a string.",
		type: String,
	})
	@ApiBadRequestResponse({
		description: "Bad request",
	})
	async saveRoomAsPlaylist(@Param("roomID") roomID: string): Promise<string> {
		console.log("saveRoomAsPlaylist for room: " + roomID);
		return "";
	}

	/**
	 * Evaluate if a room can be split
	 *
	 * @param roomID - The ID of the room to evaluate.
	 * @returns An array of the possible genres (if possible) or 4xx if not possible.
	 */
	@Get(":roomID/split")
	@ApiTags("rooms")
	@ApiOperation({
		summary: "Evaluate if a room can be split",
		operationId: "checkRoomSplit",
	})
	@ApiParam({
		name: "roomID",
		description: "The ID of the room to evaluate.",
		required: true,
		type: String,
		format: "uuid",
		example: "123e4567-e89b-12d3-a456-426614174000",
		allowEmptyValue: false,
	})
	@ApiOkResponse({
		description:
			"An array of the possible genres (if possible) or an empty array if not possible.",
	})
	async checkRoomSplit(@Param("roomID") roomID: string): Promise<string[]> {
		return await this.roomsService.canSplitRoom(roomID);
	}

	/**
	 * Returns a RoomDto with info about its split children
	 *
	 * @param roomID - The ID of the room to get the split children for.
	 * @returns The RoomDto.
	 */
	@Post(":roomID/split")
	@ApiTags("rooms")
	@ApiOperation({
		summary: "Returns a RoomDto with info about its split children",
		operationId: "splitRoom",
	})
	@ApiParam({
		name: "roomID",
		description: "The ID of the room to get the split children for.",
		required: true,
		type: String,
		format: "uuid",
		example: "123e4567-e89b-12d3-a456-426614174000",
		allowEmptyValue: false,
	})
	@ApiOkResponse({
		description: "The RoomDto.",
		type: RoomDto,
	})
	async splitRoom(@Param("roomID") roomID: string): Promise<RoomDto> {
		return await this.roomsService.splitRoom(roomID);
	}
}
