import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
	Put,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { SongInfoDto } from "./dto/songinfo.dto";
import { RoomsService } from "./rooms.service";
import { CreateRoomDto } from "./dto/createroomdto";
import { UpdateRoomDto } from "./dto/updateroomdto";
import { RoomDto } from "./dto/room.dto";
import { UserProfileDto } from "../profile/dto/userprofile.dto";

@Controller("rooms")
export class RoomsController {
	constructor(private readonly roomsService: RoomsService) {}

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

	/*
    GET /rooms/new
    gets newly created public rooms
    no input
    response: an array of RoomDto
    */
	@Get("new")
	@ApiTags("rooms")
	getNewRooms(): RoomDto[] {
		return this.roomsService.getNewRooms();
	}

	/*
    GET /rooms/{room_id}
    returns info about a room
    no input
    response: RoomDto
    */
	@Get(":room_id")
	@ApiTags("rooms")
	getRoomInfo(
		@Param("room_id") room_id: string,
		@Body() createRoomDto: CreateRoomDto,
	): RoomDto {
		return this.roomsService.getRoomInfo(room_id);
	}

	/*
    PUT/PATCH /rooms/{room_id}
    edits room info (only if it belongs to the user)
    input: partial RoomDto
    response: updated RoomDto
    */
	@Patch(":room_id")
	@ApiTags("rooms")
	updateRoomInfo(
		@Param("room_id") room_id: string,
		@Body() updateRoomDto: UpdateRoomDto,
	): RoomDto {
		return this.roomsService.updateRoomInfo(room_id, updateRoomDto);
	}

	@Put(":room_id")
	@ApiTags("rooms")
	updateRoom(
		@Param("room_id") room_id: string,
		@Body() updateRoomDto: UpdateRoomDto,
	): RoomDto {
		return this.roomsService.updateRoom(room_id, updateRoomDto);
	}

	/*
    DELETE /rooms/{room_id}
    deletes the room (only if it belongs to the user)
    no input
    response: (2xx for success, 4xx for error)
    */
	@Delete(":room_id")
	@ApiTags("rooms")
	deleteRoom(@Param("room_id") room_id: string): boolean {
		return this.roomsService.deleteRoom(room_id);
	}

	/*
    POST /rooms/{room_id}/join
    adds current user as a participant to the room
    no input
    response: (2xx for success, 4xx for error)
    */
	@Post(":room_id/join")
	@ApiTags("rooms")
	joinRoom(@Param("room_id") room_id: string): boolean {
		return this.roomsService.joinRoom(room_id);
	}

	/*
    POST /rooms/{room_id}/leave
    remove current user as a participant to the room
    no input
    response: (2xx for success, 4xx for error)
    */
	@Post(":room_id/leave")
	@ApiTags("rooms")
	leaveRoom(@Param("room_id") room_id: string): boolean {
		return this.roomsService.leaveRoom(room_id);
	}

	/*
    GET /rooms/{room_id}/users
    returns people currently (and previously in room)
    no input
    response: array of ProfileDto
    */
	@Get(":room_id/users")
	@ApiTags("rooms")
	getRoomUsers(@Param("room_id") room_id: string): UserProfileDto[] {
		return this.roomsService.getRoomUsers(room_id);
	}

	/*
    GET /rooms/{room_id}/songs
    returns the queue
    no input
    response: array of SongInfoDto
    */
	@Get(":room_id/songs")
	@ApiTags("rooms")
	getRoomQueue(@Param("room_id") room_id: string): SongInfoDto[] {
		return this.roomsService.getRoomQueue(room_id);
	}

	/*
    DELETE /rooms/{room_id}/songs
    clears the queue (except for current song, if playing)
    no input
    response: (2xx for success, 4xx for error)
    */
	@Delete(":room_id/songs")
	@ApiTags("rooms")
	clearRoomQueue(@Param("room_id") room_id: string): boolean {
		return this.roomsService.clearRoomQueue(room_id);
	}

	/*
    POST /rooms/{room_id}/songs
    add a song to queue
    input: SongInfoDto
    response: array of SongInfoDto (room queue)
    */
	@Post(":room_id/songs")
	@ApiTags("rooms")
	addSongToQueue(
		@Param("room_id") room_id: string,
		@Body() songInfoDto: SongInfoDto,
	): SongInfoDto[] {
		return this.roomsService.addSongToQueue(room_id, songInfoDto);
	}

	/*
    GET /rooms/{room_id}/songs/current
    returns the current playing song
    no input
    response: SongInfoDto
    */
	@Get(":room_id/songs/current")
	@ApiTags("rooms")
	getCurrentSong(@Param("room_id") room_id: string): SongInfoDto {
		return this.roomsService.getCurrentSong(room_id);
	}
}
