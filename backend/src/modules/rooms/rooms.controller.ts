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

@Controller("rooms")
export class RoomsController {
	constructor(
		private readonly roomsService: RoomsService,
		private readonly auth: AuthService,
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
	getRoomInfo(@Request() req: any, @Param("roomID") roomID: string): RoomDto {
		return this.roomsService.getRoomInfo(roomID);
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
	updateRoomInfo(
		@Request() req: any,
		@Param("roomID") roomID: string,
		@Body() updateRoomDto: UpdateRoomDto,
	): RoomDto {
		return this.roomsService.updateRoomInfo(roomID, updateRoomDto);
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
	deleteRoom(@Request() req: any, @Param("roomID") roomID: string): boolean {
		return this.roomsService.deleteRoom(roomID);
	}

	/*
    POST /rooms/{roomID}/join
    adds current user as a participant to the room
    no input
    response: (2xx for success, 4xx for error)
    */
	@UseGuards(JwtAuthGuard)
	@Post(":roomID/join")
	@ApiTags("rooms")
	joinRoom(@Request() req: any, @Param("roomID") roomID: string): boolean {
		return this.roomsService.joinRoom(roomID);
	}

	/*
    POST /rooms/{roomID}/leave
    remove current user as a participant to the room
    no input
    response: (2xx for success, 4xx for error)
    */
	@UseGuards(JwtAuthGuard)
	@Post(":roomID/leave")
	@ApiTags("rooms")
	leaveRoom(@Request() req: any, @Param("roomID") roomID: string): boolean {
		return this.roomsService.leaveRoom(roomID);
	}

	/*
    GET /rooms/{roomID}/users
    returns people currently (and previously in room)
    no input
    response: array of ProfileDto
    */
	@UseGuards(JwtAuthGuard)
	@Get(":roomID/users")
	@ApiTags("rooms")
	getRoomUsers(
		@Request() req: any,
		@Param("roomID") roomID: string,
	): UserProfileDto[] {
		return this.roomsService.getRoomUsers(roomID);
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
