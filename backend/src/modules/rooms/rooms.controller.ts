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
	ApiNotFoundResponse,
	ApiOkResponse,
	ApiOperation,
	ApiParam,
	ApiResponse,
	ApiTags,
	ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { SongInfoDto } from "./dto/songinfo.dto";
import { RoomsService } from "./rooms.service";
import { CreateRoomDto } from "./dto/createroomdto";
import { UpdateRoomDto } from "./dto/updateroomdto";
import { RoomDto } from "./dto/room.dto";
import { UserProfileDto } from "../profile/dto/userprofile.dto";
import { JwtAuthGuard } from "./../../auth/jwt-auth.guard";
import { AuthService, JWTPayload } from "src/auth/auth.service";
import { LiveChatMessageDto } from "src/chat/dto/livechatmessage.dto";
import { DtoGenService } from "../dto-gen/dto-gen.service";

@Controller("rooms")
export class RoomsController {
	constructor(
		private readonly roomsService: RoomsService,
		private readonly auth: AuthService,
		private readonly dtogen: DtoGenService,
	) {}

	//NOTE TO DEV:
	/*
    add decorators to each of these paths like:
    @Post()
    @ApiOperation({ summary: 'Create user' })
    @ApiBody({ type: CreateUserDto })
    @ApiResponse({ status: 201, description: 'The record has been successfully created.', type: User })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    createUser(@Body() createUserDto: CreateUserDto) {
      //...
    }

    @Get(':id')
    @ApiOperation({ summary: 'Retrieve user' })
    @ApiParam({ name: 'id', required: true })
    @ApiResponse({ status: 200, description: 'The found record', type: User })
    getUser(@Param('id') id: string) {
      //...
    }

    such that the API documentation is more detailed and informative for the next dev.
  */

	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard)
	@Get("new")
	@ApiOperation({ summary: "Get newly created public rooms" })
	@ApiParam({ name: "none" })
	@ApiOkResponse({
		description: "The new public rooms as an array of RoomDto.",
		type: RoomDto,
		isArray: true,
	})
	@ApiTags("rooms")
	async getNewRooms(): Promise<RoomDto[]> {
		return await this.roomsService.getNewRooms();
	}

	/*
    GET /rooms/{roomID}
    returns info about a room
    no input
    response: RoomDto
    */
	@UseGuards(JwtAuthGuard)
	@Get(":roomID")
	@ApiTags("rooms")
	@ApiOkResponse({
		description: "The room info as a RoomDto.",
		type: RoomDto,
	})
	@ApiParam({ name: "roomID", required: true })
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

	/*
    PUT/PATCH /rooms/{roomID}
    edits room info (only if it belongs to the user)
    input: partial RoomDto
    response: updated RoomDto
    */
	@UseGuards(JwtAuthGuard)
	@Patch(":roomID")
	@ApiTags("rooms")
	@ApiOkResponse({
		description: "Room info updated successfully.",
		type: RoomDto,
	})
	// response for when room is not found
	@ApiNotFoundResponse({
		description: "Room not found.",
	})
	@ApiParam({ name: "roomID", required: true })
	// provide summary
	@ApiOperation({ summary: "Update room info" })
	async updateRoomInfo(
		@Request() req: any,
		@Param("roomID") roomID: string,
		@Body() updateRoomDto: UpdateRoomDto,
	): Promise<RoomDto> {
		console.log("updating room with ID", roomID, "with data", updateRoomDto);
		return await this.roomsService.updateRoomInfo(roomID, updateRoomDto);
	}

	@UseGuards(JwtAuthGuard)
	@Put(":roomID")
	@ApiTags("rooms")
	updateRoom(
		@Request() req: any,
		@Param("roomID") roomID: string,
		@Body() updateRoomDto: UpdateRoomDto,
	): RoomDto {
		return this.roomsService.updateRoom(roomID, updateRoomDto);
	}

	/*
    DELETE /rooms/{roomID}
    deletes the room (only if it belongs to the user)
    no input
    response: (2xx for success, 4xx for error)
    */
	@UseGuards(JwtAuthGuard)
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
	@ApiParam({ name: "roomID", required: true })
	@ApiBearerAuth()
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
	// @ApiBearerAuth()
	@UseGuards(JwtAuthGuard)
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
	@ApiParam({ name: "roomID", required: true })
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
	@UseGuards(JwtAuthGuard)
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
	@ApiParam({ name: "roomID", required: true })
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
    response: array of ProfileDto
    */
	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard)
	@Get(":roomID/users")
	@ApiTags("rooms")
	@ApiOkResponse({
		description: "The users in the room as an array of UserProfileDto.",
		type: UserProfileDto,
		isArray: true,
	})
	@ApiOperation({ summary: "Get users in a room" })
	@ApiParam({ name: "roomID", required: true })
	async getRoomUsers(
		@Request() req: any,
		@Param("roomID") roomID: string,
	): Promise<UserProfileDto[]> {
		return await this.roomsService.getRoomUsers(roomID);
	}

	/*
    GET /rooms/{roomID}/songs
    returns the queue
    no input
    response: array of SongInfoDto
    */
	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard)
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
	async getRoomQueue(
		@Request() req: any,
		@Param("roomID") roomID: string,
		//): SongInfoDto[] {
	): Promise<string[]> {
		const userInfo: JWTPayload = this.auth.getUserInfo(req);
		//return this.roomsService.getRoomQueue(roomID);
		return this.roomsService.getRoomQueueDUMBVERSION(roomID);
	}

	/*
    DELETE /rooms/{roomID}/songs
    clears the queue (except for current song, if playing)
    no input
    response: (2xx for success, 4xx for error)
    */
	@UseGuards(JwtAuthGuard)
	@Delete(":roomID/songs")
	@ApiTags("rooms")
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
	@UseGuards(JwtAuthGuard)
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
	addSongToQueue(
		@Request() req: any,
		@Param("roomID") roomID: string,
		//@Body() songInfoDto: SongInfoDto,
		@Body() songInfoDto: string,
		//): SongInfoDto[] {
	): string[] {
		//return this.roomsService.addSongToQueue(roomID, songInfoDto);
		return this.roomsService.addSongToQueueDUMBVERSION(roomID, songInfoDto);
	}

	/*
    GET /rooms/{roomID}/songs/current
    returns the current playing song
    no input
    response: SongInfoDto
    */
	@UseGuards(JwtAuthGuard)
	@Get(":roomID/songs/current")
	@ApiTags("rooms")
	getCurrentSong(
		@Request() req: any,
		@Param("roomID") roomID: string,
	): SongInfoDto {
		return this.roomsService.getCurrentSong(roomID);
	}

	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard)
	@Get(":roomID/chat/history")
	@ApiTags("rooms")
	@ApiOperation({ summary: "Get room's chat history" })
	@ApiParam({ name: "roomID" })
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
	@UseGuards(JwtAuthGuard)
	@Post(":roomID/bookmark")
	@ApiTags("rooms")
	@ApiOperation({ summary: "Bookmark a room" })
	@ApiParam({ name: "roomID" })
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
	@UseGuards(JwtAuthGuard)
	@Post(":roomID/unbookmark")
	@ApiTags("rooms")
	@ApiOperation({ summary: "Unbookmark a room" })
	@ApiParam({ name: "roomID" })
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
}
