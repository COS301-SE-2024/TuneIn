import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../prisma/prisma.service";
import { Prisma } from "@prisma/client";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UserDto } from "./dto/user.dto";
import { CreateRoomDto } from "../rooms/dto/createroomdto";
import { UserProfileDto } from "../profile/dto/userprofile.dto";
import { RoomDto } from "../rooms/dto/room.dto";
import { DbUtilsService } from "../db-utils/db-utils.service";
import { DtoGenService } from "../dto-gen/dto-gen.service";

@Injectable()
export class UsersService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly dbUtils: DbUtilsService,
		private readonly dtogen: DtoGenService,
	) {}

	create(createUserDto: CreateUserDto) {
		const user: Prisma.usersCreateInput = {
			user_id: createUserDto.user_id,
			username: createUserDto.username,
			bio: createUserDto.bio,
			profile_picture: createUserDto.profile_picture,
			activity: createUserDto.activity,
			preferences: createUserDto.preferences,
		};
		return this.prisma.users.create({ data: user });
	}

	findAll() {
		return this.prisma.users.findMany();
	}

	findOne(user_id: string) {
		return this.prisma.users.findUnique({
			where: { user_id: user_id },
		});
	}

	update(user_id: string, updateUserDto: UpdateUserDto) {
		console.log(updateUserDto);
		const user: Prisma.usersUpdateInput = {};
		if (updateUserDto.username) user.username = updateUserDto.username;
		if (updateUserDto.bio) user.bio = updateUserDto.bio;
		if (updateUserDto.profile_picture)
			user.profile_picture = updateUserDto.profile_picture;
		if (updateUserDto.activity) user.activity = updateUserDto.activity;
		if (updateUserDto.preferences) user.preferences = updateUserDto.preferences;
		console.log(user);
		return this.prisma.users.update({
			where: { user_id: user_id },
			data: user,
		});
	}

	remove(user_id: string) {
		return this.prisma.users.delete({
			where: { user_id: user_id },
		});
	}

	getUserInfo(): UserDto {
		// implementation goes here
		return new UserDto();
	}

	updateUserProfile(updateUserDto: UpdateUserDto): UserDto {
		// implementation goes here
		return new UserDto();
	}

	updateProfile(updateUserDto: UpdateUserDto): UserDto {
		// implementation goes here
		return new UserDto();
	}

	getUserRooms(): RoomDto[] {
		// implementation goes here
		return [];
	}

	createRoom(createRoomDto: CreateRoomDto): RoomDto {
		// implementation goes here
		return new RoomDto();
	}

	getRecentRooms(): RoomDto[] {
		// implementation goes here
		return [];
	}

	getRecommendedRooms(): RoomDto[] {
		// implementation goes here
		return [];
	}

	getUserFriends(): UserProfileDto[] {
		// implementation goes here
		return [];
	}

	getFollowers(): UserProfileDto[] {
		// implementation goes here
		return [];
	}

	getFollowing(): UserProfileDto[] {
		// implementation goes here
		return [];
	}
}
