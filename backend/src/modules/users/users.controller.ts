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
	@ApiParam({ name: "none" })
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
	@ApiParam({ name: "none" })
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
	@ApiParam({ name: "none" })
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
	@ApiParam({ name: "none" })
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
	@ApiParam({ name: "none" })
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
	@ApiParam({ name: "none" })
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
	@ApiParam({ name: "none" })
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
	@ApiParam({ name: "none" })
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
	@Post(":username/follow")
	@ApiTags("users")
	@ApiOperation({ summary: "Follow the given user" })
	@ApiParam({ name: "username" })
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
	@UseGuards(JwtAuthGuard)
	@Post(":username/unfollow")
	@ApiTags("users")
	@ApiOperation({ summary: "Unfollow the given user" })
	@ApiParam({ name: "username" })
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
}
