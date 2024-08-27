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
	ApiOkResponse,
	ApiOperation,
	ApiParam,
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
	@UseGuards(JwtAuthGuard)
	@Get()
	@ApiTags("users")
	@ApiOperation({ summary: "Get current user's profile info" })
	@ApiOkResponse({
		description: "Successfully returned user profile info.",
		type: UserDto,
	})
	@ApiTags("users")
	getProfile(@Request() req: any): Promise<UserDto> {
		const userInfo: JWTPayload = this.auth.getUserInfo(req);
		return this.usersService.getProfile(userInfo.id);
	}

	@UseGuards(JwtAuthGuard)
	@Put()
	@ApiTags("users")
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

	@UseGuards(JwtAuthGuard)
	@Patch()
	@ApiTags("users")
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
	@UseGuards(JwtAuthGuard)
	@Get("rooms")
	@ApiTags("users")
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
	@UseGuards(JwtAuthGuard)
	@Post("rooms")
	@ApiTags("users")
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
	@UseGuards(JwtAuthGuard)
	@Get("rooms/recent")
	@ApiTags("users")
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
	@UseGuards(JwtAuthGuard)
	@Get("rooms/foryou")
	@ApiTags("users")
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
	@UseGuards(JwtAuthGuard)
	@Get("rooms/current")
	@ApiTags("users")
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
	@UseGuards(JwtAuthGuard)
	@Get("friends")
	@ApiTags("users")
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
	@UseGuards(JwtAuthGuard)
	@Get("friends/requests")
	@ApiTags("users")
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

	// add endpoint for getting a user's pending requests
	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard)
	@Get("friends/pending")
	@ApiTags("users")
	@ApiOperation({ summary: "Get a user's sent friend requests" })
	@ApiOkResponse({
		description: "The user's sent friend requests as an array of UserDto.",
		type: UserDto,
		isArray: true,
	})
	async getPendingRequests(@Request() req: any): Promise<UserDto[]> {
		const userInfo: JWTPayload = this.auth.getUserInfo(req);
		return await this.usersService.getPendingRequests(userInfo.id);
	}

	// add an endpoint for cancelling a friend request
	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard)
	@Post("friends/:userID/cancel")
	@ApiTags("users")
	@ApiOperation({ summary: "Cancel a friend request to the given user" })
	@ApiParam({
		name: "userID",
		description: "The userID of the user to cancel the friend request to.",
	})
	@ApiOkResponse({
		description: "Successfully cancelled friend request.",
		type: Boolean,
	})
	@ApiBadRequestResponse({
		description: "Error cancelling friend request.",
		type: Boolean,
	})
	async cancelFriendRequest(
		@Request() req: any,
		@Param("userID") userID: string,
	): Promise<boolean> {
		const userInfo: JWTPayload = this.auth.getUserInfo(req);
		return await this.usersService.cancelFriendRequest(userInfo.id, userID);
	}

	// add an endpoint to get potential friends
	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard)
	@Get("friends/potential")
	@ApiTags("users")
	@ApiOperation({ summary: "Get potential friends for the user" })
	@ApiOkResponse({
		description: "The user's potential friends as an array of UserDto.",
		type: UserDto,
		isArray: true,
	})
	async getPotentialFriends(@Request() req: any): Promise<UserDto[]> {
		const userInfo: JWTPayload = this.auth.getUserInfo(req);
		return await this.usersService.getPotentialFriends(userInfo.id);
	}

	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard)
	@Get("followers")
	@ApiTags("users")
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
	@UseGuards(JwtAuthGuard)
	@Get("following")
	@ApiTags("users")
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
	@UseGuards(JwtAuthGuard)
	@Get("bookmarks")
	@ApiTags("users")
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

	@UseGuards(JwtAuthGuard)
	@Get(":username")
	@ApiTags("users")
	@ApiOperation({ summary: "Get user profile info by username" })
	@ApiParam({
		name: "username",
		description: "The username of the user to fetch profile info for.",
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
	@UseGuards(JwtAuthGuard)
	@Post(":userID/follow")
	@ApiTags("users")
	@ApiOperation({ summary: "Follow the given user" })
	@ApiParam({
		name: "username",
		description: "The username of the user to follow.",
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
		@Param("userID") userID: string,
	): Promise<boolean> {
		const userInfo: JWTPayload = this.auth.getUserInfo(req);
		return await this.usersService.followUser(userInfo.id, userID);
	}

	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard)
	@Post(":userID/unfollow")
	@ApiTags("users")
	@ApiOperation({ summary: "Unfollow the given user" })
	@ApiParam({
		name: "username",
		description: "The username of the user to unfollow.",
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
		@Param("userID") userID: string,
	): Promise<boolean> {
		const userInfo: JWTPayload = this.auth.getUserInfo(req);
		return await this.usersService.unfollowUser(userInfo.id, userID);
	}

	/*
	### `/users/{username}/befriend`
	#### POST: sends a friend request to user with given username
	no input
	response: code (2xx for success, 4xx for error)

	### `/users/{username}/unfriend`
	#### POST: ends friendship with user
	no input
	response: code (2xx for success, 4xx for error)

	### `/users/{username}/accept`
	#### POST: accepts friend request from user
	no input
	response: code (2xx for success, 4xx for error)

	### `/users/{username}/reject`
	#### POST: accepts user's friend request
	no input
	response: code (2xx for success, 4xx for error)
	*/

	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard)
	@Post(":userID/befriend")
	@ApiTags("users")
	@ApiOperation({ summary: "Send a friend request to the given user" })
	@ApiParam({
		name: "userID",
		description: "The userID of the user to send a friend request to.",
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
		@Param("userID") userID: string,
	): Promise<boolean> {
		const userInfo: JWTPayload = this.auth.getUserInfo(req);
		return await this.usersService.befriendUser(userInfo.id, userID);
	}

	@Post(":userID/unfriend")
	@ApiTags("users")
	@UseGuards(JwtAuthGuard)
	@ApiOperation({ summary: "End friendship with the given user" })
	@ApiParam({
		name: "userID",
		description: "The userID of the user to end friendship with.",
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
		@Param("userID") userID: string,
	): Promise<boolean> {
		const userInfo: JWTPayload = this.auth.getUserInfo(req);
		return await this.usersService.unfriendUser(userInfo.id, userID);
	}

	@Post(":userID/accept")
	@ApiTags("users")
	@UseGuards(JwtAuthGuard)
	@ApiOperation({ summary: "Accept a friend request from the given user" })
	@ApiParam({
		name: "userID",
		description: "The userID of the user whose friend request to accept.",
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
		@Param("userID") userID: string,
	): Promise<boolean> {
		const userInfo: JWTPayload = this.auth.getUserInfo(req);
		return await this.usersService.acceptFriendRequest(userInfo.id, userID);
	}

	@Post(":userID/reject")
	@ApiTags("users")
	@UseGuards(JwtAuthGuard)
	@ApiOperation({ summary: "Reject a friend request from the given user" })
	@ApiParam({
		name: "userID",
		description: "The userID of the user whose friend request to reject.",
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
		@Param("userID") userID: string,
	): Promise<boolean> {
		const userInfo: JWTPayload = this.auth.getUserInfo(req);
		return await this.usersService.rejectFriendRequest(userInfo.id, userID);
	}

	/*
	### `/users/{username}/befriend`
	#### POST: sends a friend request to user with given username
	no input
	response: code (2xx for success, 4xx for error)

	### `/users/{username}/unfriend`
	#### POST: ends friendship with user
	no input
	response: code (2xx for success, 4xx for error)

	### `/users/{username}/accept`
	#### POST: accepts friend request from user
	no input
	response: code (2xx for success, 4xx for error)

	### `/users/{username}/reject`
	#### POST: accepts user's friend request
	no input
	response: code (2xx for success, 4xx for error)
	*/

	/*
	### `/users/{username}/befriend`
	#### POST: sends a friend request to user with given username
	no input
	response: code (2xx for success, 4xx for error)

	### `/users/{username}/unfriend`
	#### POST: ends friendship with user
	no input
	response: code (2xx for success, 4xx for error)

	### `/users/{username}/accept`
	#### POST: accepts friend request from user
	no input
	response: code (2xx for success, 4xx for error)

	### `/users/{username}/reject`
	#### POST: accepts user's friend request
	no input
	response: code (2xx for success, 4xx for error)
	*/
}
