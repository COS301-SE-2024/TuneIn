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
} from "@nestjs/common";
import {
	ApiTags,
	ApiOperation,
	ApiBody,
	ApiParam,
	ApiResponse,
} from "@nestjs/swagger";
import { SongInfoDto } from "./dto/songinfo.dto";
import { RoomsService } from "./rooms.service";
import { CreateRoomDto } from "./dto/createroomdto";
import { UpdateRoomDto } from "./dto/updateroomdto";
import { RoomDto } from "./dto/room.dto";
import { UserProfileDto } from "../profile/dto/userprofile.dto";
import { JwtAuthGuard } from "./../../auth/jwt-auth.guard";

@ApiTags("rooms")
@Controller("rooms")
export class RoomsController {
	constructor(private readonly roomsService: RoomsService) {}

	@UseGuards(JwtAuthGuard)
	@Get("new")
	@ApiOperation({ summary: "Get newly created public rooms" })
	@ApiResponse({
		status: 200,
		description: "An array of RoomDto",
		type: [RoomDto],
	})
	getNewRooms(): RoomDto[] {
		return this.roomsService.getNewRooms();
	}

	@UseGuards(JwtAuthGuard)
	@Get(":room_id")
	@ApiOperation({ summary: "Get room info" })
	@ApiParam({ name: "room_id", required: true })
	@ApiResponse({
		status: 200,
		description: "The room info",
		type: RoomDto,
	})
	getRoomInfo(@Param("room_id") room_id: string): RoomDto {
		return this.roomsService.getRoomInfo(room_id);
	}

	@UseGuards(JwtAuthGuard)
	@Patch(":room_id")
	@ApiOperation({ summary: "Update room info (partial update)" })
	@ApiParam({ name: "room_id", required: true })
	@ApiBody({ type: UpdateRoomDto })
	@ApiResponse({
		status: 200,
		description: "The updated room info",
		type: RoomDto,
	})
	updateRoomInfo(
		@Param("room_id") room_id: string,
		@Body() updateRoomDto: UpdateRoomDto,
	): RoomDto {
		return this.roomsService.updateRoomInfo(room_id, updateRoomDto);
	}

	@UseGuards(JwtAuthGuard)
	@Put(":room_id")
	@ApiOperation({ summary: "Update room info (full update)" })
	@ApiParam({ name: "room_id", required: true })
	@ApiBody({ type: UpdateRoomDto })
	@ApiResponse({
		status: 200,
		description: "The updated room info",
		type: RoomDto,
	})
	updateRoom(
		@Param("room_id") room_id: string,
		@Body() updateRoomDto: UpdateRoomDto,
	): RoomDto {
		return this.roomsService.updateRoom(room_id, updateRoomDto);
	}

	@UseGuards(JwtAuthGuard)
	@Delete(":room_id")
	@ApiOperation({ summary: "Delete a room" })
	@ApiParam({ name: "room_id", required: true })
	@ApiResponse({
		status: 200,
		description: "Room deleted successfully",
	})
	@ApiResponse({
		status: 403,
		description: "Forbidden.",
	})
	deleteRoom(@Param("room_id") room_id: string): boolean {
		return this.roomsService.deleteRoom(room_id);
	}

	@UseGuards(JwtAuthGuard)
	@Post(":room_id/join")
	@ApiOperation({ summary: "Join a room" })
	@ApiParam({ name: "room_id", required: true })
	@ApiResponse({
		status: 200,
		description: "Joined the room successfully",
	})
	@ApiResponse({
		status: 403,
		description: "Forbidden.",
	})
	joinRoom(@Param("room_id") room_id: string): boolean {
		return this.roomsService.joinRoom(room_id);
	}

	@UseGuards(JwtAuthGuard)
	@Post(":room_id/leave")
	@ApiOperation({ summary: "Leave a room" })
	@ApiParam({ name: "room_id", required: true })
	@ApiResponse({
		status: 200,
		description: "Left the room successfully",
	})
	@ApiResponse({
		status: 403,
		description: "Forbidden.",
	})
	leaveRoom(@Param("room_id") room_id: string): boolean {
		return this.roomsService.leaveRoom(room_id);
	}

	@UseGuards(JwtAuthGuard)
	@Get(":room_id/users")
	@ApiOperation({ summary: "Get users in a room" })
	@ApiParam({ name: "room_id", required: true })
	@ApiResponse({
		status: 200,
		description: "An array of user profiles",
		type: [UserProfileDto],
	})
	getRoomUsers(@Param("room_id") room_id: string): UserProfileDto[] {
		return this.roomsService.getRoomUsers(room_id);
	}

	@UseGuards(JwtAuthGuard)
	@Get(":room_id/songs")
	@ApiOperation({ summary: "Get room song queue" })
	@ApiParam({ name: "room_id", required: true })
	@ApiResponse({
		status: 200,
		description: "An array of SongInfoDto",
		type: [SongInfoDto],
	})
	getRoomQueue(@Param("room_id") room_id: string): SongInfoDto[] {
		return this.roomsService.getRoomQueue(room_id);
	}

	@UseGuards(JwtAuthGuard)
	@Delete(":room_id/songs")
	@ApiOperation({ summary: "Clear room song queue" })
	@ApiParam({ name: "room_id", required: true })
	@ApiResponse({
		status: 200,
		description: "Queue cleared successfully",
	})
	@ApiResponse({
		status: 403,
		description: "Forbidden.",
	})
	clearRoomQueue(@Param("room_id") room_id: string): boolean {
		return this.roomsService.clearRoomQueue(room_id);
	}

	@UseGuards(JwtAuthGuard)
	@Post(":room_id/songs")
	@ApiOperation({ summary: "Add a song to the room queue" })
	@ApiParam({ name: "room_id", required: true })
	@ApiBody({ type: SongInfoDto })
	@ApiResponse({
		status: 200,
		description: "Song added to the queue",
		type: [SongInfoDto],
	})
	@ApiResponse({
		status: 403,
		description: "Forbidden.",
	})
	addSongToQueue(
		@Param("room_id") room_id: string,
		@Body() songInfoDto: SongInfoDto,
	): SongInfoDto[] {
		return this.roomsService.addSongToQueue(room_id, songInfoDto);
	}

	@UseGuards(JwtAuthGuard)
	@Get(":room_id/songs/current")
	@ApiOperation({ summary: "Get current playing song" })
	@ApiParam({ name: "room_id", required: true })
	@ApiResponse({
		status: 200,
		description: "The current song",
		type: SongInfoDto,
	})
	getCurrentSong(@Param("room_id") room_id: string): SongInfoDto {
		return this.roomsService.getCurrentSong(room_id);
	}
}
