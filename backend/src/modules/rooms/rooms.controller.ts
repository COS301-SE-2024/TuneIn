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

@Controller("rooms")
export class RoomsController {
	constructor(private readonly roomsService: RoomsService) {}

	/*
    GET /rooms/new
    gets newly created public rooms
    no input
    response: an array of RoomDto
    */
	@Get("new")
	@ApiTags("rooms")
	getNewRooms() {
		return this.roomsService.getNewRooms();
	}

	/*
    POST /rooms
    creates a new room
    input: partial RoomDto
    response: final RoomDto for room (including new id)
    */
	@Get(":room_id")
	@ApiTags("rooms")
	getRoomInfo(@Param("room_id") room_id: string) {
		return this.roomsService.getRoomInfo(room_id);
	}

	/*
    PUT/PATCH /rooms
    edits room info (only if it belongs to the user)
    input: partial RoomDto
    response: updated RoomDto
    */
	@Patch(":room_id")
	@ApiTags("rooms")
	updateRoomInfo(
		@Param("room_id") room_id: string,
		@Body() updateRoomDto: UpdateRoomDto,
	) {
		return this.roomsService.updateRoomInfo(room_id, updateRoomDto);
	}

	@Put(":room_id")
	@ApiTags("rooms")
	updateRoom(
		@Param("room_id") room_id: string,
		@Body() updateRoomDto: UpdateRoomDto,
	) {
		return this.roomsService.updateRoom(room_id, updateRoomDto);
	}

	/*
    DELETE /rooms
    deletes the room (only if it belongs to the user)
    no input
    response: (2xx for success, 4xx for error)
    */
	@Delete(":room_id")
	@ApiTags("rooms")
	deleteRoom(@Param("room_id") room_id: string) {
		return this.roomsService.deleteRoom(room_id);
	}

	/*
    POST /rooms/{room_id}
    adds current user as a participant to the room
    no input
    response: (2xx for success, 4xx for error)
    */
	@Post(":room_id/join")
	@ApiTags("rooms")
	joinRoom(@Param("room_id") room_id: string) {
		return this.roomsService.joinRoom(room_id);
	}

	/*
    POST /rooms/{room_id}
    remove current user as a participant to the room
    no input
    response: (2xx for success, 4xx for error)
    */
	@Post(":room_id/leave")
	@ApiTags("rooms")
	leaveRoom(@Param("room_id") room_id: string) {
		return this.roomsService.leaveRoom(room_id);
	}

	/*
    GET /rooms/{room_id}
    returns people currently (and previously in room)
    no input
    response: array of ProfileDto
    */
	@Get(":room_id/users")
	@ApiTags("rooms")
	getRoomUsers(@Param("room_id") room_id: string) {
		return this.roomsService.getRoomUsers(room_id);
	}

	/*
    GET /rooms/{room_id}
    returns the queue
    no input
    response: array of SongInfoDto
    */
	@Get(":room_id/songs")
	@ApiTags("rooms")
	getRoomQueue(@Param("room_id") room_id: string) {
		return this.roomsService.getRoomQueue(room_id);
	}

	/*
    DELETE /rooms/{room_id}
    clears the queue (except for current song, if playing)
    no input
    response: (2xx for success, 4xx for error)
    */
	@Delete(":room_id/songs")
	@ApiTags("rooms")
	clearRoomQueue(@Param("room_id") room_id: string) {
		return this.roomsService.clearRoomQueue(room_id);
	}

	/*
    POST /rooms/{room_id}
    add a song to queue
    input: SongInfoDto
    response: array of SongInfoDto (room queue)
    */
	@Post(":room_id/songs")
	@ApiTags("rooms")
	addSongToQueue(
		@Param("room_id") room_id: string,
		@Body() songInfoDto: SongInfoDto,
	) {
		return this.roomsService.addSongToQueue(room_id, songInfoDto);
	}

	/*
    GET /rooms/{room_id}
    returns the current playing song
    no input
    response: SongInfoDto
    */
	@Get(":room_id/songs/current")
	@ApiTags("rooms")
	getCurrentSong(@Param("room_id") room_id: string) {
		return this.roomsService.getCurrentSong(room_id);
	}
}
