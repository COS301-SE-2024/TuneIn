import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../prisma/prisma.service";
import * as PrismaTypes from "@prisma/client";
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
			user_id: createUserDto.userID,
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

	findOne(userID: string) {
		return this.prisma.users.findUnique({
			where: { user_id: userID },
		});
	}

	update(userID: string, updateUserDto: UpdateUserDto) {
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
			where: { user_id: userID },
			data: user,
		});
	}

	remove(userID: string) {
		return this.prisma.users.delete({
			where: { user_id: userID },
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

	async getUserRooms(userID: string): Promise<RoomDto[]> {
		// implementation goes here
		const user = await this.prisma.users.findUnique({
			where: { user_id: userID },
		});

		if (!user) {
			throw new Error("User does not exist");
		}

		const rooms = await this.prisma.room.findMany({
			where: { room_creator: userID },
		});

		if (!rooms) {
			return [];
		}

		const ids: string[] = rooms.map((room) => room.room_id);
		const r = await this.dtogen.generateMultipleRoomDto(ids);
		if (!r || r === null) {
			throw new Error(
				"An unknown error occurred while generating RoomDto for user rooms (getUserRooms). Received null.",
			);
		}
		return r;
	}

	async createRoom(createRoomDto: CreateRoomDto): Promise<RoomDto> {
		if (!createRoomDto.creator) {
			throw new Error("No creator provided for the room");
		}

		const newRoom: Prisma.roomCreateInput = {
			name: createRoomDto.room_name || "Untitled Room",

			//foreign key relation for 'room_creator'
			users: {
				connect: {
					user_id: createRoomDto.creator.userID,
				},
			},
		};
		if (createRoomDto.roomID) newRoom.room_id = createRoomDto.roomID;
		if (createRoomDto.description)
			newRoom.description = createRoomDto.description;
		if (createRoomDto.is_temporary)
			newRoom.is_temporary = createRoomDto.is_temporary;

		/*
		if (createRoomDto.language) newRoom.language = createRoomDto.language;
		*/
		if (createRoomDto.has_explicit_content)
			newRoom.explicit = createRoomDto.has_explicit_content;
		if (createRoomDto.has_nsfw_content)
			newRoom.nsfw = createRoomDto.has_nsfw_content;
		if (createRoomDto.room_image)
			newRoom.playlist_photo = createRoomDto.room_image;

		/*
		if (createRoomDto.current_song)
			newRoom.current_song = createRoomDto.current_song;
		*/

		//for is_private, we will need to add the roomID to the private_room tbale
		if (createRoomDto.is_private) {
			newRoom.private_room = {
				connect: {
					room_id: createRoomDto.roomID,
				},
			};
		} else {
			newRoom.public_room = {
				connect: {
					room_id: createRoomDto.roomID,
				},
			};
		}

		//TODO: implement scheduled room creation
		/*
		if (createRoomDto.start_date) newRoom.start_date = createRoomDto.start_date;
		if (createRoomDto.end_date) newRoom.end_date = createRoomDto.end_date;		
		if (createRoomDto.is_scheduled) {
			newRoom.
				connect: {
					roomID: createRoomDto.roomID,
				},
			};
		}
		*/

		const room = await this.prisma.room.create({
			data: newRoom,
		});
		if (!room) {
			throw new Error("Something went wrong while creating the room");
		}

		const result = await this.dtogen.generateRoomDtoFromRoom(room);
		if (!result) {
			throw new Error(
				"An unknown error occurred while generating RoomDto for created room. Received null.",
			);
		}
		return result;
	}

	getRecentRooms(userID: string): RoomDto[] {
		// implementation goes here
		return [];
	}

	async getRecommendedRooms(userID: string): Promise<RoomDto[]> {
		//TODO: implement recommendation algorithm
		const r = await this.dbUtils.getRandomRooms(5);
		if (!r || r === null) {
			throw new Error(
				"An unknown error occurred while generating RoomDto for recommended rooms. Received null.",
			);
		}
		const rooms: PrismaTypes.room[] = r;
		const ids: string[] = rooms.map((room) => room.room_id);
		const recommends = await this.dtogen.generateMultipleRoomDto(ids);
		if (!recommends || recommends === null) {
			throw new Error(
				"An unknown error occurred while generating RoomDto for recommended rooms. Received null.",
			);
		}
		return recommends;
	}

	async getUserFriends(userID: string): Promise<UserProfileDto[]> {
		const f = await this.prisma.friends.findMany({
			where: { OR: [{ friend1: userID }, { friend2: userID }] },
		});
		if (!f) {
			return [];
		}
		const friends: PrismaTypes.friends[] = f;
		const ids: string[] = [];
		for (const friend of friends) {
			if (friend.friend1 === userID) {
				ids.push(friend.friend2);
			} else {
				ids.push(friend.friend1);
			}
		}
		const r = await this.dtogen.generateMultipleUserProfileDto(ids);
		return r;
	}

	async getFollowers(userID: string): Promise<UserProfileDto[]> {
		const f = await this.dbUtils.getUserFollowers(userID);
		if (!f) {
			return [];
		}
		const followers: PrismaTypes.users[] = f;
		const ids: string[] = followers.map((follower) => follower.user_id);
		const result = await this.dtogen.generateMultipleUserProfileDto(ids);
		if (!result) {
			throw new Error(
				"An unknown error occurred while generating UserProfileDto for followers. Received null.",
			);
		}
		return result;
	}

	async getFollowing(userID: string): Promise<UserProfileDto[]> {
		const following = await this.dbUtils.getUserFollowing(userID);
		if (!following) {
			return [];
		}
		const followees: PrismaTypes.users[] = following;
		const ids: string[] = followees.map((followee) => followee.user_id);
		const result = await this.dtogen.generateMultipleUserProfileDto(ids);
		if (!result) {
			throw new Error(
				"An unknown error occurred while generating UserProfileDto for following. Received null.",
			);
		}
		return result;
	}
}
