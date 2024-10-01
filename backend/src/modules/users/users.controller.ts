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
import { UserListeningStatsDto, UsersService } from "./users.service";
import {
	ApiBadRequestResponse,
	ApiBearerAuth,
	ApiBody,
	ApiOkResponse,
	ApiOperation,
	ApiParam,
	ApiSecurity,
	ApiTags,
	ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { UserDto } from "./dto/user.dto";
import { RoomDto } from "../rooms/dto/room.dto";
import { CreateRoomDto } from "../rooms/dto/createroomdto";
import { JwtAuthGuard } from "./../../auth/jwt-auth.guard";
import { AuthService, JWTPayload } from "../../auth/auth.service";
import { UpdateUserDto } from "./dto/updateuser.dto";
import { DirectMessageDto } from "./dto/dm.dto";

@ApiTags("users")
@Controller("users")
export class UsersController {
	constructor(
		private readonly usersService: UsersService,
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
	/*
	@ApiHeader({
		name: "Authorization",
		description: "Bearer token for authentication",
	})
	*/
	@Get()
	@ApiOperation({
		summary: "Get current user's profile info",
		description: "Get the profile info of the currently authenticated user.",
		operationId: "getProfile",
	})
	@ApiOkResponse({
		description: "Successfully returned user profile info.",
		type: UserDto,
	})
	getProfile(@Request() req: Request): Promise<UserDto> {
		const userInfo: JWTPayload = this.auth.getUserInfo(req);
		return this.usersService.getProfile(userInfo.id);
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
	@Put()
	@ApiOperation({
		summary: "Update user's profile info",
		description: "Update the profile info of the currently authenticated user.",
		operationId: "putProfile",
	})
	@ApiOkResponse({
		description: "Returns the updated user profile info.",
		type: UserDto,
	})
	@ApiBadRequestResponse({
		description: "Bad request. The request body may be malformed.",
	})
	@ApiBody({
		type: UpdateUserDto,
		required: true,
		description: "The updated user profile info",
	})
	async putProfile(
		@Request() req: Request,
		@Body() updateProfileDto: UpdateUserDto,
	): Promise<UserDto> {
		const userInfo: JWTPayload = this.auth.getUserInfo(req);
		return await this.usersService.updateProfile(userInfo.id, updateProfileDto);
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
	@Patch()
	@ApiOperation({
		summary: "Update user's profile info",
		description: "Update the profile info of the currently authenticated user.",
		operationId: "patchProfile",
	})
	@ApiOkResponse({
		description: "Returns the updated user profile info.",
		type: UserDto,
	})
	@ApiBadRequestResponse({
		description: "Bad request. The request body may be malformed.",
	})
	@ApiBody({
		type: UpdateUserDto,
		required: true,
		description: "The updated user profile info",
	})
	async patchProfile(
		@Request() req: Request,
		@Body() updateProfileDto: UpdateUserDto,
	): Promise<UserDto> {
		const userInfo: JWTPayload = this.auth.getUserInfo(req);
		return await this.usersService.updateProfile(userInfo.id, updateProfileDto);
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
	@Get("dms")
	@ApiOperation({
		summary: "Get the last DMs sent to or received from another user",
		description:
			"Get all of the last DMs either sent to or received from another user",
		operationId: "getDMs",
	})
	@ApiOkResponse({
		description: "The last DMs as an array of DirectMessageDto.",
		type: DirectMessageDto,
		isArray: true,
	})
	async getDMs(@Request() req: Request): Promise<DirectMessageDto[]> {
		const userInfo: JWTPayload = this.auth.getUserInfo(req);
		return await this.usersService.getLastDMs(userInfo.id);
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
	@Get("stats")
	@ApiOperation({
		summary: "Get a user's listening stats",
		description:
			"Get the listening stats of the authenticated user, including total time listened, and average listening time per day, most played songs, genres, and artists.",
		operationId: "getListeningStats",
	})
	@ApiOkResponse({
		description: "The user's listening stats as a UserListeningStatsDto.",
		type: UserListeningStatsDto,
	})
	async getListeningStats(
		@Request() req: Request,
	): Promise<UserListeningStatsDto> {
		const userInfo: JWTPayload = this.auth.getUserInfo(req);
		return await this.usersService.getListeningStats(userInfo.id);
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
	@Get("rooms")
	@ApiOperation({
		summary: "Get the user's rooms",
		description: "Get all of the rooms that the user created.",
		operationId: "getUserRooms",
	})
	@ApiOkResponse({
		description: "The user's rooms as an array of RoomDto.",
		type: RoomDto,
		isArray: true,
	})
	async getUserRooms(@Request() req: Request): Promise<RoomDto[]> {
		console.log("called /users/rooms");
		const userInfo: JWTPayload = this.auth.getUserInfo(req);
		return await this.usersService.getUserRooms(userInfo.id);
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
	@Post("rooms")
	@ApiOperation({
		summary: "Create a new room",
		description: "Create a new room with the given information.",
		operationId: "createRoom",
	})
	@ApiOkResponse({
		description: "The newly created room as a RoomDto.",
		type: RoomDto,
	})
	@ApiBody({
		type: CreateRoomDto,
		required: true,
		description: "The room to create",
	})
	async createRoom(
		@Request() req: Request,
		@Body() createRoomDto: CreateRoomDto,
	): Promise<RoomDto> {
		const userInfo: JWTPayload = this.auth.getUserInfo(req);
		return await this.usersService.createRoom(createRoomDto, userInfo.id);
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
	@Get("rooms/recent")
	@ApiOperation({
		summary: "Get a user's recent rooms",
		description: "Get the user's most recently visited rooms.",
		operationId: "getRecentRooms",
	})
	@ApiOkResponse({
		description: "The user's recent rooms as an array of RoomDto.",
		type: RoomDto,
		isArray: true,
	})
	@ApiBadRequestResponse({
		description: "Invalid request parameters or missing required headers.",
	})
	async getRecentRooms(@Request() req: Request): Promise<RoomDto[]> {
		const userInfo: JWTPayload = this.auth.getUserInfo(req);
		return await this.usersService.getRecentRoomsById(userInfo.id);
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
	@Get(":username/rooms/recent")
	@ApiOperation({
		summary: "Get a user's recent rooms",
		description: "Get the user's most recently visited rooms.",
		operationId: "getRecentRoomsByUsername",
	})
	@ApiOkResponse({
		description: "The user's recent rooms as an array of RoomDto.",
		type: RoomDto,
		isArray: true,
	})
	@ApiBadRequestResponse({
		description: "Username does not exist or is invalid.",
	})
	async getRecentRoomsByUsername(
		@Param("username") username: string,
	): Promise<RoomDto[]> {
		return await this.usersService.getRecentRoomByUsername(username);
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
	@Get("rooms/foryou")
	@ApiOperation({
		summary: "Get a user's recommended rooms",
		description: "Get the rooms that are recommended for the user.",
		operationId: "getRecommendedRooms",
	})
	@ApiOkResponse({
		description: "The user's recommended rooms as an array of RoomDto.",
		type: RoomDto,
		isArray: true,
	})
	async getRecommendedRooms(@Request() req: Request): Promise<RoomDto[]> {
		const userInfo: JWTPayload = this.auth.getUserInfo(req);
		return await this.usersService.getRecommendedRooms(userInfo.id);
	}

	// create an endpoint to fetch new rooms from friends
	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard)
	@Get("rooms/friends")
	@ApiTags("users")
	@ApiOperation({ summary: "Get rooms from friends" })
	@ApiOkResponse({
		description: "Rooms from friends retrieved successfully",
		type: RoomDto,
		isArray: true,
	})
	@ApiBadRequestResponse({
		description: "Error getting rooms from friends.",
	})
	async getRoomsFromFriends(@Request() req: Request): Promise<RoomDto[]> {
		const userInfo: JWTPayload = this.auth.getUserInfo(req);
		return await this.usersService.getRoomsFromFriends(userInfo.id);
	}

	// create an endpoint to fetch new rooms from people you follow (following)
	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard)
	@Get("rooms/following")
	@ApiTags("users")
	@ApiOperation({ summary: "Get rooms from people you follow" })
	@ApiOkResponse({
		description: "Rooms from people you follow retrieved successfully",
		type: RoomDto,
		isArray: true,
	})
	@ApiBadRequestResponse({
		description: "Error getting rooms from people you follow.",
	})
	async getRoomsFromFollowing(@Request() req: Request): Promise<RoomDto[]> {
		const userInfo: JWTPayload = this.auth.getUserInfo(req);
		return await this.usersService.getRoomsFromFollowing(userInfo.id);
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
	@Get("rooms/current")
	@ApiOperation({
		summary: "Get a user's current room",
		description: "Get the room that the user is currently in.",
		operationId: "getCurrentRoom",
	})
	@ApiOkResponse({
		description: "The user's current room as a RoomDto.",
		type: RoomDto,
	})
	async getCurrentRoom(@Request() req: Request): Promise<RoomDto> {
		const userInfo: JWTPayload = this.auth.getUserInfo(req);
		return await this.usersService.getCurrentRoomDto(userInfo.id);
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
	@Get("friends")
	@ApiOperation({
		summary: "Get a user's friends",
		operationId: "getUserFriends",
	})
	@ApiOkResponse({
		description: "The user's friends as an array of UserDto.",
		type: UserDto,
		isArray: true,
	})
	async getUserFriends(@Request() req: Request): Promise<UserDto[]> {
		const userInfo: JWTPayload = this.auth.getUserInfo(req);
		return await this.usersService.getUserFriends(userInfo.id);
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
	@Get("friends/requests")
	@ApiOperation({
		summary: "Get a user's friend requests",
		operationId: "getFriendRequests",
	})
	@ApiOkResponse({
		description: "The user's friend requests as an array of UserDto.",
		type: UserDto,
		isArray: true,
	})
	async getFriendRequests(@Request() req: Request): Promise<UserDto[]> {
		const userInfo: JWTPayload = this.auth.getUserInfo(req);
		return await this.usersService.getFriendRequests(userInfo.id);
	}

	// add endpoint for getting a user's pending requests
	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard)
	@Get("friends/pending")
	@ApiTags("users")
	@ApiOperation({
		summary: "Get a user's sent friend requests",
		operationId: "getPendingRequests",
	})
	@ApiOkResponse({
		description: "The user's sent friend requests as an array of UserDto.",
		type: UserDto,
		isArray: true,
	})
	@ApiBadRequestResponse({
		description: "Error getting pending friend requests.",
	})
	async getPendingRequests(@Request() req: Request): Promise<UserDto[]> {
		const userInfo: JWTPayload = this.auth.getUserInfo(req);
		return await this.usersService.getPendingRequests(userInfo.id);
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
	@ApiBadRequestResponse({
		description: "Error getting potential friends.",
	})
	async getPotentialFriends(@Request() req: Request): Promise<UserDto[]> {
		const userInfo: JWTPayload = this.auth.getUserInfo(req);
		return await this.usersService.getPotentialFriends(userInfo.id);
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
	@Get("followers")
	@ApiOperation({
		summary: "Get a user's followers",
		description: "Get all of the users that follow the authenticated user.",
		operationId: "getFollowers",
	})
	@ApiOkResponse({
		description: "The user's followers as an array of UserDto.",
		type: UserDto,
		isArray: true,
	})
	async getFollowers(@Request() req: Request): Promise<UserDto[]> {
		const userInfo: JWTPayload = this.auth.getUserInfo(req);
		return await this.usersService.getFollowers(userInfo.id);
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
	@Get("following")
	@ApiOperation({
		summary: "Get a user's following",
		description: "Get all of the users that the authenticated user follows.",
		operationId: "getFollowing",
	})
	@ApiOkResponse({
		description: "The user's following as an array of UserDto.",
		type: UserDto,
		isArray: true,
	})
	async getFollowing(@Request() req: Request): Promise<UserDto[]> {
		const userInfo: JWTPayload = this.auth.getUserInfo(req);
		return await this.usersService.getFollowing(userInfo.id);
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
	@Get("blocked")
	@ApiOperation({
		summary: "Get blocked users",
		description:
			"Get all of the users that the authenticated user has blocked.",
		operationId: "getBlocked",
	})
	@ApiOkResponse({
		description: "The user's following as an array of UserDto.",
		type: UserDto,
		isArray: true,
	})
	async getBlocked(@Request() req: Request): Promise<UserDto[]> {
		const userInfo: JWTPayload = this.auth.getUserInfo(req);
		return await this.usersService.getFollowing(userInfo.id);
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
	@Get("bookmarks")
	@ApiOperation({
		summary: "Get the authorized user's bookmarks",
		description: "Get all of the rooms that the user has bookmarked.",
		operationId: "getBookmarks",
	})
	@ApiOkResponse({
		description: "The user's bookmarks as an array of RoomDto.",
		type: RoomDto,
		isArray: true,
	})
	async getBookmarks(@Request() req: Request): Promise<RoomDto[]> {
		const userInfo: JWTPayload = this.auth.getUserInfo(req);
		return await this.usersService.getBookmarksById(userInfo.id);
	}

	@Get(":username/bookmarks")
	@ApiOperation({
		summary: "Get the authorized user's bookmarks",
		description: "Get all of the rooms that the user has bookmarked.",
		operationId: "getBookmarksByUsername",
	})
	@ApiOkResponse({
		description: "The user's bookmarks as an array of RoomDto.",
		type: RoomDto,
		isArray: true,
	})
	@ApiBadRequestResponse({
		description: "Username does not exist or is invalid.",
	})
	async getBookmarksByUsername(
		@Param("username") username: string,
	): Promise<RoomDto[]> {
		return await this.usersService.getBookmarksByUsername(username);
	}

	@Get(":username/taken")
	@ApiOperation({
		summary: "Check if a username is taken",
		description: "Get all of the rooms that the user has bookmarked.",
		operationId: "isUsernameTaken",
	})
	@ApiOkResponse({
		description: "True if taken, false if not.",
	})
	async isUsernameTaken(@Param("username") username: string): Promise<boolean> {
		return await this.usersService.usernameTaken(username);
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
	@Get(":username")
	@ApiOperation({
		summary: "Get user profile info by username",
		description: "Get the profile info of the user with the given username.",
		operationId: "getProfileByUsername",
	})
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
		console.log("called /users/:username");
		return this.usersService.getProfileByUsername(username);
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
	@Post(":username/follow")
	@ApiOperation({
		summary: "Follow the given user",
		description: "Follow the user with the given username.",
		operationId: "followUser",
	})
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
	})
	@ApiBadRequestResponse({
		description: "Error following the user.",
	})
	async followUser(
		@Request() req: Request,
		@Param("username") username: string,
	): Promise<void> {
		const userInfo: JWTPayload = this.auth.getUserInfo(req);
		await this.usersService.followUser(userInfo.id, username);
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
	@Post(":username/unfollow")
	@ApiOperation({
		summary: "Unfollow the given user",
		description: "Unfollow the user with the given username.",
		operationId: "unfollowUser",
	})
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
	})
	@ApiBadRequestResponse({
		description: "Error unfollowing the user.",
	})
	async unfollowUser(
		@Request() req: Request,
		@Param("username") username: string,
	): Promise<void> {
		const userInfo: JWTPayload = this.auth.getUserInfo(req);
		await this.usersService.unfollowUser(userInfo.id, username);
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
	@Post(":username/befriend")
	@ApiOperation({
		summary: "Send a friend request to the given user",
		description: "Send a friend request to the user with the given username.",
		operationId: "befriendUser",
	})
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
	})
	@ApiBadRequestResponse({
		description: "Error sending friend request.",
	})
	async befriendUser(
		@Request() req: Request,
		@Param("username") username: string,
	): Promise<void> {
		const userInfo: JWTPayload = this.auth.getUserInfo(req);
		await this.usersService.befriendUser(userInfo.id, username);
	}

	@Post(":username/unfriend")
	@ApiBearerAuth()
	@ApiSecurity("bearer")
	@UseGuards(JwtAuthGuard)
	/*
	@ApiHeader({
		name: "Authorization",
		description: "Bearer token for authentication",
	})
	*/
	@ApiOperation({
		summary: "End friendship with the given user",
		description: "End friendship with the user with the given username.",
		operationId: "unfriendUser",
	})
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
	})
	@ApiBadRequestResponse({
		description: "Error ending friendship.",
	})
	async unfriendUser(
		@Request() req: Request,
		@Param("username") username: string,
	): Promise<void> {
		const userInfo: JWTPayload = this.auth.getUserInfo(req);
		await this.usersService.unfriendUser(userInfo.id, username);
	}

	@Post(":username/accept")
	@ApiBearerAuth()
	@ApiSecurity("bearer")
	@UseGuards(JwtAuthGuard)
	/*
	@ApiHeader({
		name: "Authorization",
		description: "Bearer token for authentication",
	})
	*/
	@ApiOperation({
		summary: "Accept a friend request from the given user",
		description:
			"Accept a friend request from the user with the given username.",
		operationId: "acceptFriendRequest",
	})
	@ApiParam({
		name: "username",
		description:
			"Our new friend. The username of the user to accept a friend request from.",
		required: true,
		type: String,
		example: "johndoe",
		allowEmptyValue: false,
	})
	@ApiOkResponse({
		description: "Successfully accepted friend request.",
	})
	@ApiBadRequestResponse({
		description: "Error accepting friend request.",
	})
	async acceptFriendRequest(
		@Request() req: Request,
		@Param("username") username: string,
	): Promise<void> {
		const userInfo: JWTPayload = this.auth.getUserInfo(req);
		await this.usersService.acceptFriendRequest(userInfo.id, username);
	}

	@Post(":username/reject")
	@ApiBearerAuth()
	@ApiSecurity("bearer")
	@UseGuards(JwtAuthGuard)
	/*
	@ApiHeader({
		name: "Authorization",
		description: "Bearer token for authentication",
	})
	*/
	@ApiOperation({
		summary: "Reject a friend request from the given user",
		description:
			"Reject a friend request from the user with the given username.",
		operationId: "rejectFriendRequest",
	})
	@ApiParam({
		name: "username",
		description:
			"The username of the user whose friend request we are rejecting.",
		required: true,
		type: String,
		example: "johndoe",
		allowEmptyValue: false,
	})
	@ApiOkResponse({
		description: "Successfully rejected friend request.",
	})
	@ApiBadRequestResponse({
		description: "Error rejecting friend request.",
	})
	async rejectFriendRequest(
		@Request() req: Request,
		@Param("username") username: string,
	): Promise<void> {
		const userInfo: JWTPayload = this.auth.getUserInfo(req);
		await this.usersService.rejectFriendRequest(userInfo.id, username);
	}

	// add an endpoint for cancelling a friend request
	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard)
	@Post(":username/cancel")
	@ApiTags("users")
	@ApiOperation({
		summary: "Cancel a friend request to the given user",
		operationId: "cancelFriendRequest",
	})
	@ApiParam({
		name: "username",
		description: "The username of the user to cancel the friend request to.",
	})
	@ApiOkResponse({
		description: "Successfully cancelled friend request.",
	})
	@ApiBadRequestResponse({
		description: "Error cancelling friend request.",
	})
	async cancelFriendRequest(
		@Request() req: Request,
		@Param("username") username: string,
	): Promise<boolean> {
		const userInfo: JWTPayload = this.auth.getUserInfo(req);
		return await this.usersService.cancelFriendRequest(userInfo.id, username);
	}

	// create endpoint to get a user's recommended users
	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard)
	@ApiSecurity("bearer")
	@Get("recommended/users")
	@ApiOperation({ summary: "Get recommended users" })
	@ApiOkResponse({
		description: "Recommended users retrieved successfully",
		type: UserDto,
		isArray: true,
	})
	@ApiUnauthorizedResponse({
		description: "Unauthorized",
	})
	@ApiTags("users")
	async getRecommendedUsers(@Request() req: Request): Promise<UserDto[]> {
		console.log("called /users/recommended/users");
		const userInfo: JWTPayload = this.auth.getUserInfo(req);
		return await this.usersService.getRecommendedUsers(userInfo.id);
	}

	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard)
	@Get(":username/room/current")
	@ApiOperation({ summary: "Get a user's current room based on username" })
	@ApiParam({
		name: "username",
		description: "The username of user's current room to search for.",
	})
	@ApiOkResponse({
		description: "User's current room retrieved successfully",
		type: RoomDto,
	})
	@ApiUnauthorizedResponse({
		description: "Unauthorized",
	})
	@ApiBadRequestResponse({
		description: "Username does not exist or is invalid.",
	})
	@ApiTags("rooms")
	async getCurrentRoomByUserId(
		@Param("username") username: string,
	): Promise<RoomDto> {
		return await this.usersService.getCurrentRoomDto(username);
	}

	@Post(":username/block")
	@ApiBearerAuth()
	@ApiSecurity("bearer")
	@UseGuards(JwtAuthGuard)
	/*
	@ApiHeader({
		name: "Authorization",
		description: "Bearer token for authentication",
	})
	*/
	@ApiOperation({
		summary: "Block a given user",
		description: "Block the user with the given username.",
		operationId: "blockUser",
	})
	@ApiParam({
		name: "username",
		description: "The username of the user to block.",
		required: true,
		type: String,
		example: "johndoe",
		allowEmptyValue: false,
	})
	@ApiOkResponse({
		description: "Successfully blocked the user.",
	})
	@ApiBadRequestResponse({
		description: "Error blocking the user.",
	})
	async blockUser(
		@Request() req: Request,
		@Param("username") username: string,
	): Promise<void> {
		const userInfo: JWTPayload = this.auth.getUserInfo(req);
		await this.usersService.blockUser(userInfo.id, username);
	}

	@Post(":username/unblock")
	@ApiBearerAuth()
	@ApiSecurity("bearer")
	@UseGuards(JwtAuthGuard)
	/*
	@ApiHeader({
		name: "Authorization",
		description: "Bearer token for authentication",
	})
	*/
	@ApiOperation({
		summary: "Unblock a given user",
		description: "Unblock the user with the given username.",
		operationId: "unblockUser",
	})
	@ApiParam({
		name: "username",
		description: "The username of the user to unblock.",
		required: true,
		type: String,
		example: "johndoe",
		allowEmptyValue: false,
	})
	@ApiOkResponse({
		description: "Successfully unblocked the user.",
	})
	@ApiBadRequestResponse({
		description: "Error unblocking the user.",
	})
	async unblockUser(
		@Request() req: Request,
		@Param("username") username: string,
	): Promise<void> {
		const userInfo: JWTPayload = this.auth.getUserInfo(req);
		await this.usersService.unblockUser(userInfo.id, username);
	}

	@Post(":username/report")
	@ApiBearerAuth()
	@ApiSecurity("bearer")
	@UseGuards(JwtAuthGuard)
	/*
	@ApiHeader({
		name: "Authorization",
		description: "Bearer token for authentication",
	})
	*/
	@ApiOperation({
		summary: "Report a given user",
		description: "Report the user with the given username.",
		operationId: "reportUser",
	})
	@ApiParam({
		name: "username",
		description: "The username of the user to report.",
		required: true,
		type: String,
		example: "johndoe",
		allowEmptyValue: false,
	})
	@ApiOkResponse({
		description: "Successfully reported the user.",
	})
	@ApiBadRequestResponse({
		description: "Error reporting the user.",
	})
	async reportUser(
		@Request() req: Request,
		@Param("username") username: string,
	): Promise<void> {
		const userInfo: JWTPayload = this.auth.getUserInfo(req);
		await this.usersService.reportUser(userInfo.id, username);
	}
}
