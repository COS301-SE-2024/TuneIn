import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { ApiTags } from "@nestjs/swagger";

/*
### `/user` (not demo 1)
#### GET: gets user info
no input
response: return UserDto
#### PUT or PATCH: user profile info
input: UserDto
response: return updated UserDto

### `/user/rooms`
related to a user's own rooms
#### GET: get a user's rooms
no input
response: an array of RoomDto
#### POST: create a new room
input: partial RoomDto
response: final RoomDto for room (including new id)

### `/user/rooms/recent`
#### GET: get user's recent rooms
no input
response: an array of RoomDto

### `/user/rooms/foryou`
#### GET: get user's recommended rooms
no input
response: an array of RoomDto

### `/user/friends`
#### GET: get user's friends
no input
response: an array of ProfileDto

### `/user/followers`
#### GET: get list of followers
no input
response: an array of ProfileDto
### `/users/following`
#### GET: get list of people user is following
no input
response: an array of ProfileDto
*/
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

	@Get()
	@ApiTags("users")
	getUserInfo() {
		return this.usersService.getUserInfo();
	}

	@Patch()
	@ApiTags("users")
	updateUserProfile(@Body() updateUserDto: UpdateUserDto) {
		return this.usersService.updateUserProfile(updateUserDto);
	}

	@Get("rooms")
	@ApiTags("users")
	getUserRooms() {
		return this.usersService.getUserRooms();
	}

	@Post("rooms")
	@ApiTags("users")
	createRoom(@Body() createRoomDto: any) {
		return this.usersService.createRoom(createRoomDto);
	}

	@Get("rooms/recent")
	@ApiTags("users")
	getRecentRooms() {
		return this.usersService.getRecentRooms();
	}

	@Get("rooms/foryou")
	@ApiTags("users")
	getRecommendedRooms() {
		return this.usersService.getRecommendedRooms();
	}

	@Get("friends")
	@ApiTags("users")
	getUserFriends() {
		return this.usersService.getUserFriends();
	}

	@Get("followers")
	@ApiTags("users")
	getFollowers() {
		return this.usersService.getFollowers();
	}

	@Get("following")
	@ApiTags("users")
	getFollowing() {
		return this.usersService.getFollowing();
	}
}
