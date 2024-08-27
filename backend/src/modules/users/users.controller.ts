import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Put,
	UseGuards,
	Request,
	Param,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import {
	ApiBadRequestResponse,
	ApiBearerAuth,
	ApiHeader,
	ApiOkResponse,
	ApiOperation,
	ApiParam,
	ApiSecurity,
	ApiTags,
} from "@nestjs/swagger";
import { UserDto } from "./dto/user.dto";
import { RoomDto } from "../rooms/dto/room.dto";
import { CreateRoomDto } from "../rooms/dto/createroomdto";
import { JwtAuthGuard } from "./../../auth/jwt-auth.guard";
import { DbUtilsService } from "../db-utils/db-utils.service";
import { DtoGenService } from "../dto-gen/dto-gen.service";
import { AuthService, JWTPayload } from "../../auth/auth.service";
import { UpdateUserDto } from "./dto/updateuser.dto";
import { DirectMessageDto } from "./dto/dm.dto";

@ApiTags("users")
@Controller("users")
export class UsersController {
	constructor(
		private readonly usersService: UsersService,
		private readonly dbUtils: DbUtilsService,
		private readonly dtogen: DtoGenService,
		private readonly auth: AuthService,
	) {}

	//basic CRUD operations on the users table
	/*
	@Post()
	create(@Body() createUserDto: CreateUserDto) {
		return this.usersService.create(createUserDto);
	}

	@Get()
	findAll() {
		return this.usersService.findAll();
	}

	@Get(":id")
	findOne(@Param("id") id: string) {
		return this.usersService.findOne(id);
	}

	@Patch(":id")
	update(@Param("id") id: string, @Body() updateUserDto: UpdateUserDto) {
		const result = this.usersService.update(id, updateUserDto);
		console.log(result);
		return result;
	}

	@Delete(":id")
	remove(@Param("id") id: string) {
		return this.usersService.remove(id);
	}
  */
	@ApiBearerAuth()
	@ApiSecurity("bearer")
	@UseGuards(JwtAuthGuard)
	@ApiHeader({
		name: "Authorization",
		description: "Bearer token for authentication",
	})
	@Get()
	@ApiOperation({ summary: "Get current user's profile info" })
	@ApiOkResponse({
		description: "Successfully returned user profile info.",
		type: UserDto,
	})
	getProfile(@Request() req: any): Promise<UserDto> {
		const userInfo: JWTPayload = this.auth.getUserInfo(req);
		return this.usersService.getProfile(userInfo.id);
	}

	@ApiBearerAuth()
	@ApiSecurity("bearer")
	@UseGuards(JwtAuthGuard)
	@ApiHeader({
		name: "Authorization",
		description: "Bearer token for authentication",
	})
	@Put()
	@ApiOperation({ summary: "Update user's profile info" })
	@ApiOkResponse({
		description: "Returns the updated user profile info.",
		type: UserDto,
	})
	@ApiBadRequestResponse({
		description: "Bad request. The request body may be malformed.",
	})
	async putProfile(
		@Request() req: any,
		@Body() updateProfileDto: UpdateUserDto,
	): Promise<UserDto> {
		const userInfo: JWTPayload = this.auth.getUserInfo(req);
		return await this.usersService.updateProfile(userInfo.id, updateProfileDto);
	}

	@ApiBearerAuth()
	@ApiSecurity("bearer")
	@UseGuards(JwtAuthGuard)
	@ApiHeader({
		name: "Authorization",
		description: "Bearer token for authentication",
	})
	@Patch()
	@ApiOperation({ summary: "Update user's profile info" })
	@ApiOkResponse({
		description: "Returns the updated user profile info.",
		type: UserDto,
	})
	@ApiBadRequestResponse({
		description: "Bad request. The request body may be malformed.",
	})
	async patchProfile(
		@Request() req: any,
		@Body() updateProfileDto: UpdateUserDto,
	): Promise<UserDto> {
		const userInfo: JWTPayload = this.auth.getUserInfo(req);
		return await this.usersService.updateProfile(userInfo.id, updateProfileDto);
	}

	@ApiBearerAuth()
	@ApiSecurity("bearer")
	@UseGuards(JwtAuthGuard)
	@ApiHeader({
		name: "Authorization",
		description: "Bearer token for authentication",
	})
	@Get("dms")
	@ApiOperation({
		summary: "Get the last DMs sent to or received from another user",
	})
	@ApiOkResponse({
		description: "The last DMs as an array of DirectMessageDto.",
		type: Object,
	})
	async getDMs(@Request() req: any): Promise<DirectMessageDto[]> {
		const userInfo: JWTPayload = this.auth.getUserInfo(req);
		return await this.usersService.getLastDMs(userInfo.id);
	}

	@ApiBearerAuth()
	@ApiSecurity("bearer")
	@UseGuards(JwtAuthGuard)
	@ApiHeader({
		name: "Authorization",
		description: "Bearer token for authentication",
	})
	@Get("rooms")
	@ApiOperation({ summary: "Get a user's rooms" })
	@ApiOkResponse({
		description: "The user's rooms as an array of RoomDto.",
		type: RoomDto,
		isArray: true,
	})
	async getUserRooms(@Request() req: any): Promise<RoomDto[]> {
		console.log("called /users/rooms");
		const userInfo: JWTPayload = this.auth.getUserInfo(req);
		return await this.usersService.getUserRooms(userInfo.id);
	}

	@ApiBearerAuth()
	@ApiSecurity("bearer")
	@UseGuards(JwtAuthGuard)
	@ApiHeader({
		name: "Authorization",
		description: "Bearer token for authentication",
	})
	@Post("rooms")
	@ApiOperation({ summary: "Create a new room" })
	@ApiOkResponse({
		description: "The newly created room as a RoomDto.",
		type: RoomDto,
	})
	async createRoom(
		@Request() req: any,
		@Body() createRoomDto: CreateRoomDto,
	): Promise<RoomDto> {
		const userInfo: JWTPayload = this.auth.getUserInfo(req);
		return await this.usersService.createRoom(createRoomDto, userInfo.id);
	}

	@ApiBearerAuth()
	@ApiSecurity("bearer")
	@UseGuards(JwtAuthGuard)
	@ApiHeader({
		name: "Authorization",
		description: "Bearer token for authentication",
	})
	@Get("rooms/recent")
	@ApiOperation({ summary: "Get a user's recent rooms" })
	@ApiOkResponse({
		description: "The user's recent rooms as an array of RoomDto.",
		type: RoomDto,
		isArray: true,
	})
	async getRecentRooms(@Request() req: any): Promise<RoomDto[]> {
		const userInfo: JWTPayload = this.auth.getUserInfo(req);
		return await this.usersService.getRecentRooms(userInfo.id);
	}

	@ApiBearerAuth()
	@ApiSecurity("bearer")
	@UseGuards(JwtAuthGuard)
	@ApiHeader({
		name: "Authorization",
		description: "Bearer token for authentication",
	})
	@Get("rooms/foryou")
	@ApiOperation({ summary: "Get a user's recommended rooms" })
	@ApiOkResponse({
		description: "The user's recommended rooms as an array of RoomDto.",
		type: RoomDto,
		isArray: true,
	})
	async getRecommendedRooms(@Request() req: any): Promise<RoomDto[]> {
		const userInfo: JWTPayload = this.auth.getUserInfo(req);
		return await this.usersService.getRecommendedRooms(userInfo.id);
	}

	@ApiBearerAuth()
	@ApiSecurity("bearer")
	@UseGuards(JwtAuthGuard)
	@ApiHeader({
		name: "Authorization",
		description: "Bearer token for authentication",
	})
	@Get("rooms/current")
	@ApiOperation({
		summary: "Get a user's current room (room that they are currently in)",
	})
	@ApiOkResponse({
		description:
			"The user's current room as a RoomDto or {} if they are not in a room.",
		type: RoomDto,
	})
	async getCurrentRoom(@Request() req: any): Promise<RoomDto | object> {
		const userInfo: JWTPayload = this.auth.getUserInfo(req);
		return await this.usersService.getCurrentRoom(userInfo.id);
	}

	@ApiBearerAuth()
	@ApiSecurity("bearer")
	@UseGuards(JwtAuthGuard)
	@ApiHeader({
		name: "Authorization",
		description: "Bearer token for authentication",
	})
	@Get("friends")
	@ApiOperation({ summary: "Get a user's friends" })
	@ApiOkResponse({
		description: "The user's friends as an array of UserDto.",
		type: UserDto,
		isArray: true,
	})
	async getUserFriends(@Request() req: any): Promise<UserDto[]> {
		const userInfo: JWTPayload = this.auth.getUserInfo(req);
		return await this.usersService.getUserFriends(userInfo.id);
	}

	@ApiBearerAuth()
	@ApiSecurity("bearer")
	@UseGuards(JwtAuthGuard)
	@ApiHeader({
		name: "Authorization",
		description: "Bearer token for authentication",
	})
	@Get("friends/requests")
	@ApiOperation({ summary: "Get a user's friend requests" })
	@ApiOkResponse({
		description: "The user's friend requests as an array of UserDto.",
		type: UserDto,
		isArray: true,
	})
	async getFriendRequests(@Request() req: any): Promise<UserDto[]> {
		const userInfo: JWTPayload = this.auth.getUserInfo(req);
		return await this.usersService.getFriendRequests(userInfo.id);
	}

	@ApiBearerAuth()
	@ApiSecurity("bearer")
	@UseGuards(JwtAuthGuard)
	@ApiHeader({
		name: "Authorization",
		description: "Bearer token for authentication",
	})
	@Get("followers")
	@ApiOperation({ summary: "Get a user's followers" })
	@ApiParam({ name: "none" })
	@ApiOkResponse({
		description: "The user's followers as an array of UserDto.",
		type: UserDto,
		isArray: true,
	})
	async getFollowers(@Request() req: any): Promise<UserDto[]> {
		const userInfo: JWTPayload = this.auth.getUserInfo(req);
		return await this.usersService.getFollowers(userInfo.id);
	}

	@ApiBearerAuth()
	@ApiSecurity("bearer")
	@UseGuards(JwtAuthGuard)
	@ApiHeader({
		name: "Authorization",
		description: "Bearer token for authentication",
	})
	@Get("following")
	@ApiOperation({ summary: "Get a user's following" })
	@ApiOkResponse({
		description: "The user's following as an array of UserDto.",
		type: UserDto,
		isArray: true,
	})
	async getFollowing(@Request() req: any): Promise<UserDto[]> {
		const userInfo: JWTPayload = this.auth.getUserInfo(req);
		return await this.usersService.getFollowing(userInfo.id);
	}

	@ApiBearerAuth()
	@ApiSecurity("bearer")
	@UseGuards(JwtAuthGuard)
	@ApiHeader({
		name: "Authorization",
		description: "Bearer token for authentication",
	})
	@Get("bookmarks")
	@ApiOperation({ summary: "Get the authorized user's bookmarks" })
	@ApiOkResponse({
		description: "The user's bookmarks as an array of RoomDto.",
		type: RoomDto,
		isArray: true,
	})
	async getBookmarks(@Request() req: any): Promise<RoomDto[]> {
		const userInfo: JWTPayload = this.auth.getUserInfo(req);
		return await this.usersService.getBookmarks(userInfo.id);
	}

	@ApiBearerAuth()
	@ApiSecurity("bearer")
	@UseGuards(JwtAuthGuard)
	@ApiHeader({
		name: "Authorization",
		description: "Bearer token for authentication",
	})
	@Get(":username")
	@ApiOperation({ summary: "Get user profile info by username" })
	@ApiParam({
		name: "username",
		description: "The username of the user to fetch profile info for.",
		required: true,
		type: String,
		example: "johndoe",
		allowEmptyValue: false,
	})
	@ApiOkResponse({
		description: "Returns the user profile.",
		type: UserDto,
	})
	async getProfileByUsername(
		@Param("username") username: string,
	): Promise<UserDto> {
		return this.usersService.getProfileByUsername(username);
	}

	@ApiBearerAuth()
	@ApiSecurity("bearer")
	@UseGuards(JwtAuthGuard)
	@ApiHeader({
		name: "Authorization",
		description: "Bearer token for authentication",
	})
	@Post(":username/follow")
	@ApiOperation({ summary: "Follow the given user" })
	@ApiParam({
		name: "username",
		description: "The username of the user to follow.",
		required: true,
		type: String,
		example: "johndoe",
		allowEmptyValue: false,
	})
	@ApiOkResponse({
		description: "Successfully followed the user.",
		type: Boolean,
	})
	@ApiBadRequestResponse({
		description: "Error following the user.",
		type: Boolean,
	})
	async followUser(
		@Request() req: any,
		@Param("username") username: string,
	): Promise<boolean> {
		const userInfo: JWTPayload = this.auth.getUserInfo(req);
		return await this.usersService.followUser(userInfo.id, username);
	}

	@ApiBearerAuth()
	@ApiSecurity("bearer")
	@UseGuards(JwtAuthGuard)
	@ApiHeader({
		name: "Authorization",
		description: "Bearer token for authentication",
	})
	@Post(":username/unfollow")
	@ApiOperation({ summary: "Unfollow the given user" })
	@ApiParam({
		name: "username",
		description: "The username of the user to unfollow.",
		required: true,
		type: String,
		example: "johndoe",
		allowEmptyValue: false,
	})
	@ApiOkResponse({
		description: "Successfully unfollowed the user.",
		type: Boolean,
	})
	@ApiBadRequestResponse({
		description: "Error unfollowing the user.",
		type: Boolean,
	})
	async unfollowUser(
		@Request() req: any,
		@Param("username") username: string,
	): Promise<boolean> {
		const userInfo: JWTPayload = this.auth.getUserInfo(req);
		return await this.usersService.unfollowUser(userInfo.id, username);
	}

	@ApiBearerAuth()
	@ApiSecurity("bearer")
	@UseGuards(JwtAuthGuard)
	@ApiHeader({
		name: "Authorization",
		description: "Bearer token for authentication",
	})
	@Post(":username/befriend")
	@ApiOperation({ summary: "Send a friend request to the given user" })
	@ApiParam({
		name: "username",
		description: "The username of the user to send a friend request to.",
		required: true,
		type: String,
		example: "johndoe",
		allowEmptyValue: false,
	})
	@ApiOkResponse({
		description: "Successfully sent friend request.",
		type: Boolean,
	})
	@ApiBadRequestResponse({
		description: "Error sending friend request.",
		type: Boolean,
	})
	async befriendUser(
		@Request() req: any,
		@Param("username") username: string,
	): Promise<boolean> {
		const userInfo: JWTPayload = this.auth.getUserInfo(req);
		return await this.usersService.befriendUser(userInfo.id, username);
	}

	@Post(":username/unfriend")
	@ApiBearerAuth()
	@ApiSecurity("bearer")
	@UseGuards(JwtAuthGuard)
	@ApiHeader({
		name: "Authorization",
		description: "Bearer token for authentication",
	})
	@ApiOperation({ summary: "End friendship with the given user" })
	@ApiParam({
		name: "username",
		description: "The username of the user to end friendship with.",
		required: true,
		type: String,
		example: "johndoe",
		allowEmptyValue: false,
	})
	@ApiOkResponse({
		description: "Successfully ended friendship.",
		type: Boolean,
	})
	@ApiBadRequestResponse({
		description: "Error ending friendship.",
		type: Boolean,
	})
	async unfriendUser(
		@Request() req: any,
		@Param("username") username: string,
	): Promise<boolean> {
		const userInfo: JWTPayload = this.auth.getUserInfo(req);
		return await this.usersService.unfriendUser(userInfo.id, username);
	}

	@Post(":username/accept")
	@ApiBearerAuth()
	@ApiSecurity("bearer")
	@UseGuards(JwtAuthGuard)
	@ApiHeader({
		name: "Authorization",
		description: "Bearer token for authentication",
	})
	@ApiOperation({ summary: "Accept a friend request from the given user" })
	@ApiParam({
		name: "username",
		description: "Our new friend. The username of the user to accept a friend request from.",
		required: true,
		type: String,
		example: "johndoe",
		allowEmptyValue: false,
	})
	@ApiOkResponse({
		description: "Successfully accepted friend request.",
		type: Boolean,
	})
	@ApiBadRequestResponse({
		description: "Error accepting friend request.",
		type: Boolean,
	})
	async acceptFriendRequest(
		@Request() req: any,
		@Param("username") username: string,
	): Promise<boolean> {
		const userInfo: JWTPayload = this.auth.getUserInfo(req);
		return await this.usersService.acceptFriendRequest(userInfo.id, username);
	}

	@Post(":username/reject")
	@ApiBearerAuth()
	@ApiSecurity("bearer")
	@UseGuards(JwtAuthGuard)
	@ApiHeader({
		name: "Authorization",
		description: "Bearer token for authentication",
	})
	@ApiOperation({ summary: "Reject a friend request from the given user" })
	@ApiParam({
		name: "username",
		description: "The username of the user whose friend request we are rejecting.",
		required: true,
		type: String,
		example: "johndoe",
		allowEmptyValue: false,
	})
	@ApiOkResponse({
		description: "Successfully rejected friend request.",
		type: Boolean,
	})
	@ApiBadRequestResponse({
		description: "Error rejecting friend request.",
		type: Boolean,
	})
	async rejectFriendRequest(
		@Request() req: any,
		@Param("username") username: string,
	): Promise<boolean> {
		const userInfo: JWTPayload = this.auth.getUserInfo(req);
		return await this.usersService.rejectFriendRequest(userInfo.id, username);
	}
}
