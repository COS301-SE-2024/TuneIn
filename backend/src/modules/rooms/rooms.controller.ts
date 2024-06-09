import { Body, Controller, Delete, Get, Param, Patch, Post, Put } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { SongInfoDto } from "./dto/songinfo.dto";
import { RoomsService } from "./rooms.service";

/*
### `/rooms`

### `/rooms/new`
#### GET: returns newly created public rooms
no input
response: an array of RoomDto

### `/rooms/{room_id}`
#### GET: returns info about a room
no input
response: RoomDto

#### PUT or PATCH: edits room info (only if it belongs to the user)
input: partial RoomDto
response: updated RoomDto

#### DELETE: deletes the room (only if it belongs to the user)
no input
response: (2xx for success, 4xx for error)

### `/rooms/{room_id}/join`
#### POST: adds current user as a participant to the room
no input
response: (2xx for success, 4xx for error)

### `/rooms/{room_id}/leave`
#### POST: remove current user as a participant to the room
no input
response: (2xx for success, 4xx for error)

### `/rooms/{room_id}/users`
#### GET: returns people currently (and previously in room)
no input
response: array of ProfileDto

### `/rooms/{room_id}/songs` (not for demo 1)
#### GET: returns the queue
no input
response: array of SongInfoDto

#### DELETE: clears the queue (except for current song, if playing)
no input
response: (2xx for success, 4xx for error)

#### POST: add a song to queue
input: SongInfoDto
response: array of SongInfoDto (room queue)

### `/rooms/{room_id}/songs/current` (not for demo 1)
#### GET: returns the current playing song
no input
response: SongInfoDto

#### DELETE: skips the current song
no input
response: SongInfoDto (updated with new song playing)
*/
@Controller("rooms")
export class RoomsController {
    constructor(private readonly roomsService: RoomsService) {}

    @Get("new")
    @ApiTags("rooms")
    getNewRooms() {
        return this.roomsService.getNewRooms();
    }

    @Get(":room_id")
    @ApiTags("rooms")
    getRoomInfo(@Param("room_id") room_id: string) {
        return this.roomsService.getRoomInfo(room_id);
    }

    @Patch(":room_id")
    @ApiTags("rooms")
    updateRoomInfo(
        @Param("room_id") room_id: string,
        @Body() updateRoomDto: UpdateRoomDto
    ) {
        return this.roomsService.updateRoomInfo(room_id, updateRoomDto);
    }

    @Put(":room_id")
    @ApiTags("rooms")
    updateRoom(@Param("room_id") room_id: string, @Body() updateRoomDto: UpdateRoomDto) {
        return this.roomsService.updateRoom(room_id, updateRoomDto);
    }


    @Delete(":room_id")
    @ApiTags("rooms")
    deleteRoom(@Param("room_id") room_id: string) {
        return this.roomsService.deleteRoom(room_id);
    }

    @Post(":room_id/join")
    @ApiTags("rooms")
    joinRoom(@Param("room_id") room_id: string) {
        return this.roomsService.joinRoom(room_id);
    }

    @Post(":room_id/leave")
    @ApiTags("rooms")
    leaveRoom(@Param("room_id") room_id: string) {
        return this.roomsService.leaveRoom(room_id);
    }

    @Get(":room_id/users")
    @ApiTags("rooms")
    getRoomUsers(@Param("room_id") room_id: string) {
        return this.roomsService.getRoomUsers(room_id);
    }

    @Get(":room_id/songs")
    @ApiTags("rooms")
    getRoomQueue(@Param("room_id") room_id: string) {
        return this.roomsService.getRoomQueue(room_id);
    }

    @Delete(":room_id/songs")
    @ApiTags("rooms")
    clearRoomQueue(@Param("room_id") room_id: string) {
        return this.roomsService.clearRoomQueue(room_id);
    }

    @Post(":room_id/songs")
    @ApiTags("rooms")
    addSongToQueue(
        @Param("room_id") room_id: string,
        @Body() songInfoDto: SongInfoDto
    ) {
        return this.roomsService.addSongToQueue(room_id, songInfoDto);
    }

    @Get(":room_id/songs/current")
    @ApiTags("rooms")
    getCurrentSong(@Param("room_id") room_id: string) {
        return this.roomsService.getCurrentSong(room
}
