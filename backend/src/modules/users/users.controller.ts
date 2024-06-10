import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Put,
	UseGuards,
	Request,
	HttpException,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import {
	ApiBearerAuth,
	ApiOkResponse,
	ApiOperation,
	ApiParam,
	ApiTags,
} from "@nestjs/swagger";
import { UserDto } from "./dto/user.dto";
import { RoomDto } from "../rooms/dto/room.dto";
import { CreateRoomDto } from "../rooms/dto/createroomdto";
import { UserProfileDto } from "../profile/dto/userprofile.dto";
import { JwtAuthGuard } from "./../../auth/jwt-auth.guard";
import { DbUtilsService } from "../db-utils/db-utils.service";
import { DtoGenService } from "../dto-gen/dto-gen.service";

@ApiTags("users")
@Controller("users")
export class UsersController {
	constructor(
		private readonly usersService: UsersService,
		private readonly dbUtils: DbUtilsService,
		private readonly dtogen: DtoGenService,
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

	/*
    GET /users
    gets user info
    no input
    response: return UserDto
  */
	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard)
	@Get()
	@ApiTags("users")
	getUserInfo(@Request() req: any): UserDto {
		//try to get sub, username & email back from JWT token
		console.log("1");
		console.log("2", req);
		console.log("3", req.user);
		//req.user
		/*
		{
			userId: '311ce2e8-8041-70bd-0ab5-be97283ee182',
			username: 'bigdaddy'
		}
		*/
		console.log("4", req.user.sub);
		console.log("5", req.user.username);
		console.log("6", req.user.email);

		return this.usersService.getUserInfo();
	}

	/*
    PUT/PATCH /users
    user profile info
    input: UserDto
    response: return updated UserDto
  */
	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard)
	@Patch()
	@ApiTags("users")
	updateUserProfile(
		@Request() req: any,
		@Body() updateUserDto: UpdateUserDto,
	): UserDto {
		return this.usersService.updateUserProfile(updateUserDto);
	}

	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard)
	@Put()
	@ApiTags("users")
	updateProfile(
		@Request() req: any,
		@Body() updateUserDto: UpdateUserDto,
	): UserDto {
		return this.usersService.updateProfile(updateUserDto);
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
		const userID = req.user.sub;
		if (!userID || userID === "" || typeof userID !== "string") {
			throw new Error("Invalid user ID in JWT token. Please log in again.");
		}
		return await this.usersService.getUserRooms(userID);
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
		const userID = req.user.sub;
		if (!userID || userID === "" || typeof userID !== "string") {
			throw new Error("Invalid user ID in JWT token. Please log in again.");
		}

		if (!createRoomDto.creator) {
			const creator = await this.dtogen.generateUserProfileDto(userID, false);
			if (creator) {
				createRoomDto.creator = creator;
			} else {
				throw new HttpException(
					"Failed to generate creator profile from user ID.",
					500,
				);
			}
		}

		if (userID !== createRoomDto.creator.userID) {
			throw new HttpException(
				"User ID in JWT token does not match creator ID in request body.",
				400,
			);
		}
		return await this.usersService.createRoom(createRoomDto);
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
		const userID = req.user.sub;
		if (!userID || userID === "" || typeof userID !== "string") {
			throw new Error("Invalid user ID in JWT token. Please log in again.");
		}
		return await this.usersService.getRecentRooms(userID);
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
		return this.usersService.getRecommendedRooms();
	}

	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard)
	@Get("friends")
	@ApiTags("users")
	@ApiOperation({ summary: "Get a user's friends" })
	@ApiParam({ name: "none" })
	@ApiOkResponse({
		description: "The user's friends as an array of UserProfileDto.",
		type: UserProfileDto,
		isArray: true,
	})
	getUserFriends(@Request() req: any): UserProfileDto[] {
		return this.usersService.getUserFriends();
	}

	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard)
	@Get("followers")
	@ApiTags("users")
	@ApiOperation({ summary: "Get a user's followers" })
	@ApiParam({ name: "none" })
	@ApiOkResponse({
		description: "The user's followers as an array of UserProfileDto.",
		type: UserProfileDto,
		isArray: true,
	})
	getFollowers(@Request() req: any): UserProfileDto[] {
		return this.usersService.getFollowers();
	}

	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard)
	@Get("following")
	@ApiTags("users")
	@ApiOperation({ summary: "Get a user's following" })
	@ApiParam({ name: "none" })
	@ApiOkResponse({
		description: "The user's following as an array of UserProfileDto.",
		type: UserProfileDto,
		isArray: true,
	})
	getFollowing(@Request() req: any): UserProfileDto[] {
		return this.usersService.getFollowing();
	}
}
