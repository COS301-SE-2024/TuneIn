import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Put,
	UseGuards,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { ApiTags } from "@nestjs/swagger";
import { UserDto } from "./dto/user.dto";
import { RoomDto } from "../rooms/dto/room.dto";
import { CreateRoomDto } from "../rooms/dto/createroomdto";
import { UserProfileDto } from "../profile/dto/userprofile.dto";
import { JwtAuthGuard } from "./../../auth/jwt-auth.guard";

@ApiTags("users")
@Controller("users")
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

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
    GET /users
    gets user info
    no input
    response: return UserDto
  */
	@UseGuards(JwtAuthGuard)
	@Get()
	@ApiTags("users")
	getUserInfo(): UserDto {
		return this.usersService.getUserInfo();
	}

	/*
    PUT/PATCH /users
    user profile info
    input: UserDto
    response: return updated UserDto
  */
	@UseGuards(JwtAuthGuard)
	@Patch()
	@ApiTags("users")
	updateUserProfile(@Body() updateUserDto: UpdateUserDto): UserDto {
		return this.usersService.updateUserProfile(updateUserDto);
	}

	@UseGuards(JwtAuthGuard)
	@Put()
	@ApiTags("users")
	updateProfile(@Body() updateUserDto: UpdateUserDto): UserDto {
		return this.usersService.updateProfile(updateUserDto);
	}

	/*
    GET /users/rooms
    get a user's rooms
    no input
    response: an array of RoomDto
  */
	@UseGuards(JwtAuthGuard)
	@Get("rooms")
	@ApiTags("users")
	getUserRooms(): RoomDto[] {
		return this.usersService.getUserRooms();
	}

	/*
    POST /users/rooms
    create a new room
    input: partial RoomDto
    response: final RoomDto for room (including new id)
  */
	@UseGuards(JwtAuthGuard)
	@Post("rooms")
	@ApiTags("users")
	createRoom(@Body() createRoomDto: CreateRoomDto): RoomDto {
		return this.usersService.createRoom(createRoomDto);
	}

	/*
    GET /users/rooms/recent
    get user's recent rooms
    no input
    response: an array of RoomDto
  */
	@UseGuards(JwtAuthGuard)
	@Get("rooms/recent")
	@ApiTags("users")
	getRecentRooms(): RoomDto[] {
		return this.usersService.getRecentRooms();
	}

	/*
    GET /users/rooms/foryou
    get user's recommended rooms
    no input
    response: an array of RoomDto
  */
	@UseGuards(JwtAuthGuard)
	@Get("rooms/foryou")
	@ApiTags("users")
	getRecommendedRooms(): RoomDto[] {
		return this.usersService.getRecommendedRooms();
	}

	/*
    GET /users/friends
    get user's friends
    no input
    response: an array of ProfileDto
  */
	@UseGuards(JwtAuthGuard)
	@Get("friends")
	@ApiTags("users")
	getUserFriends(): UserProfileDto[] {
		return this.usersService.getUserFriends();
	}

	/*
    GET /users/followers
    get list of followers
    no input
    response: an array of ProfileDto
  */
	@UseGuards(JwtAuthGuard)
	@Get("followers")
	@ApiTags("users")
	getFollowers(): UserProfileDto[] {
		return this.usersService.getFollowers();
	}

	/*
    GET /users/following
    get list of people user is following
    no input
    response: an array of ProfileDto
  */
	@UseGuards(JwtAuthGuard)
	@Get("following")
	@ApiTags("users")
	getFollowing(): UserProfileDto[] {
		return this.usersService.getFollowing();
	}
}
