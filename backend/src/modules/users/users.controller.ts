import { Controller, Get, Post, Body, Patch, Put } from "@nestjs/common";
import { UsersService } from "./users.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { ApiTags } from "@nestjs/swagger";

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
	@Get()
	@ApiTags("users")
	getUserInfo() {
		return this.usersService.getUserInfo();
	}

	/*
    PUT/PATCH /users
    user profile info
    input: UserDto
    response: return updated UserDto
  */
	@Patch()
	@ApiTags("users")
	updateUserProfile(@Body() updateUserDto: UpdateUserDto) {
		return this.usersService.updateUserProfile(updateUserDto);
	}

	@Put()
	@ApiTags("users")
	updateProfile(@Body() updateUserDto: UpdateUserDto) {
		return this.usersService.updateProfile(updateUserDto);
	}

	/*
    GET /users/rooms
    get a user's rooms
    no input
    response: an array of RoomDto
  */
	@Get("rooms")
	@ApiTags("users")
	getUserRooms() {
		return this.usersService.getUserRooms();
	}

	/*
    POST /users/rooms
    create a new room
    input: partial RoomDto
    response: final RoomDto for room (including new id)
  */
	@Post("rooms")
	@ApiTags("users")
	createRoom(@Body() createRoomDto: any) {
		return this.usersService.createRoom(createRoomDto);
	}

	/*
    GET /users/rooms/recent
    get user's recent rooms
    no input
    response: an array of RoomDto
  */
	@Get("rooms/recent")
	@ApiTags("users")
	getRecentRooms() {
		return this.usersService.getRecentRooms();
	}

	/*
    GET /users/rooms/foryou
    get user's recommended rooms
    no input
    response: an array of RoomDto
  */
	@Get("rooms/foryou")
	@ApiTags("users")
	getRecommendedRooms() {
		return this.usersService.getRecommendedRooms();
	}

	/*
    GET /users/friends
    get user's friends
    no input
    response: an array of ProfileDto
  */
	@Get("friends")
	@ApiTags("users")
	getUserFriends() {
		return this.usersService.getUserFriends();
	}

	/*
    GET /users/followers
    get list of followers
    no input
    response: an array of ProfileDto
  */
	@Get("followers")
	@ApiTags("users")
	getFollowers() {
		return this.usersService.getFollowers();
	}

	/*
    GET /users/following
    get list of people user is following
    no input
    response: an array of ProfileDto
  */
	@Get("following")
	@ApiTags("users")
	getFollowing() {
		return this.usersService.getFollowing();
	}
}
