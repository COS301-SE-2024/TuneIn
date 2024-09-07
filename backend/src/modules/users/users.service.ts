import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { PrismaService } from "../../../prisma/prisma.service";
import * as PrismaTypes from "@prisma/client";
import { Prisma } from "@prisma/client";
import { UserDto } from "./dto/user.dto";
import { CreateRoomDto } from "../rooms/dto/createroomdto";
import { RoomDto } from "../rooms/dto/room.dto";
import { DbUtilsService } from "../db-utils/db-utils.service";
import { DtoGenService } from "../dto-gen/dto-gen.service";
import { UpdateUserDto } from "./dto/updateuser.dto";
import { DirectMessageDto } from "./dto/dm.dto";
import { IsNumber, IsObject, ValidateNested } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UserListeningStatsDto {
	@ApiProperty({
		description: "The total number of songs listened to by the user",
		example: 100,
	})
	@IsNumber()
	totalListenedSongs: number;

	/* whatever else you want */
}

@Injectable()
export class UsersService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly dbUtils: DbUtilsService,
		private readonly dtogen: DtoGenService,
	) {}

	// Tutorial CRUD operations
	create(createUserDto: Partial<UserDto>) {
		if (!createUserDto.username) {
			throw new HttpException("Username is required", HttpStatus.BAD_REQUEST);
		}
		if (!createUserDto.bio) {
			throw new HttpException("Bio is required", HttpStatus.BAD_REQUEST);
		}
		const user: Prisma.usersCreateInput = {
			username: createUserDto.username,
			bio: createUserDto.bio,
		};
		if (createUserDto.userID) {
			user.user_id = createUserDto.userID;
		}
		if (createUserDto.profile_picture_url) {
			user.profile_picture = createUserDto.profile_picture_url;
		}
		if (createUserDto.profile_name) {
			user.full_name = createUserDto.profile_name;
		}
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

	async getProfile(uid: string): Promise<UserDto> {
		const user = await this.dtogen.generateUserDto(uid);
		return user;
	}

	async updateProfile(
		userId: string,
		updateProfileDto: UpdateUserDto,
	): Promise<UserDto> {
		const user = await this.prisma.users.findUnique({
			where: { user_id: userId },
		});

		if (!user) {
			throw new Error("User not found");
		}

		const updatedUser: Prisma.usersUpdateInput = {
			user_id: userId,
		};

		if (updateProfileDto.username) {
			updatedUser.username = updateProfileDto.username;
		}

		if (updateProfileDto.bio) {
			updatedUser.bio = updateProfileDto.bio;
		}

		if (updateProfileDto.email) {
			updatedUser.email = updateProfileDto.email;
		}

		if (updateProfileDto.profile_name) {
			updatedUser.full_name = updateProfileDto.profile_name;
		}

		if (updateProfileDto.profile_picture_url) {
			updatedUser.profile_picture = updateProfileDto.profile_picture_url;
		}

		if (updateProfileDto.links) {
			// console.log(updateProfileDto.links.data);
			// updatedUser.external_links = { data: updateProfileDto.links.data };
		}

		// Merge the preferences if they exist in the updateProfileDto
		if (updateProfileDto.fav_genres) {
			let existingPreferences = user.preferences;

			if (existingPreferences) {
				if (
					typeof existingPreferences === "object" &&
					!Array.isArray(existingPreferences)
				) {
					if (updateProfileDto.fav_genres) {
						existingPreferences.fav_genres = updateProfileDto.fav_genres
							.data as Prisma.JsonArray;
					}
				} else {
					existingPreferences = {
						fav_genres: updateProfileDto.fav_genres.data,
					};
				}
			} else {
				existingPreferences = {
					fav_genres: updateProfileDto.fav_genres.data,
				};
			}

			updatedUser.preferences = existingPreferences as Prisma.InputJsonValue;
		}

		await this.prisma.users.update({
			where: { user_id: userId },
			data: updatedUser,
		});

		const u = await this.dtogen.generateUserDto(userId);
		if (!u) {
			throw new Error("Failed to generate user profile");
		}
		return u;
	}

	async getProfileByUsername(username: string): Promise<UserDto> {
		const userData = await this.prisma.users.findFirst({
			where: { username: username },
		});

		if (!userData) {
			throw new Error("User not found");
		} else {
			const user = await this.dtogen.generateUserDto(userData.user_id);
			if (user) {
				return user;
			}
		}

		return new UserDto();
	}

	/*
	follower: the person who does the following
	followee (leader): the person being followed
	*/
	async followUser(selfID: string, usernameToFollow: string): Promise<boolean> {
		if (!(await this.dbUtils.userExists(selfID))) {
			throw new HttpException(
				"User with id: (" + selfID + ") does not exist",
				HttpStatus.NOT_FOUND,
			);
		}

		const followee = await this.prisma.users.findFirst({
			where: { username: usernameToFollow },
		});
		if (!followee) {
			throw new HttpException(
				"User (" + usernameToFollow + ") does not exist",
				HttpStatus.NOT_FOUND,
			);
		}

		if (selfID === followee.user_id) {
			throw new HttpException(
				"You cannot unfollow yourself",
				HttpStatus.BAD_REQUEST,
			);
		}

		if (await this.dbUtils.isFollowing(selfID, followee.user_id)) {
			return true;
		}

		if (await this.dbUtils.isFriendsOrPending(selfID, followee.user_id)) {
			throw new HttpException(
				"Cannot unfollow user with id: (" +
					followee.user_id +
					"). User is a friend or has a pending request",
				HttpStatus.BAD_REQUEST,
			);
		}

		try {
			await this.prisma.follows.create({
				data: {
					follower: selfID,
					followee: followee.user_id,
				},
			});
			return true;
		} catch (e) {
			throw new Error(
				"Failed to follow user with id: (" + followee.user_id + ")",
			);
		}
	}

	/*
	follower: the person who does the following
	followee (leader): the person being followed
	*/
	async unfollowUser(
		selfID: string,
		usernameToUnfollow: string,
	): Promise<boolean> {
		if (!(await this.dbUtils.userExists(selfID))) {
			throw new HttpException(
				"User with id: (" + selfID + ") does not exist",
				HttpStatus.NOT_FOUND,
			);
		}

		const followee = await this.prisma.users.findFirst({
			where: { username: usernameToUnfollow },
		});
		if (!followee) {
			throw new HttpException(
				"User (" + usernameToUnfollow + ") does not exist",
				HttpStatus.NOT_FOUND,
			);
		}

		if (selfID === followee.user_id) {
			throw new HttpException(
				"You cannot unfollow yourself",
				HttpStatus.BAD_REQUEST,
			);
		}

		if (!(await this.dbUtils.isFollowing(selfID, followee.user_id))) {
			return true;
		}

		if (await this.dbUtils.isFriendsOrPending(selfID, followee.user_id)) {
			throw new HttpException(
				"Cannot unfollow user with id: (" +
					followee.user_id +
					"). User is a friend or has a pending request",
				HttpStatus.BAD_REQUEST,
			);
		}

		try {
			//find the follow relationship and delete it
			const follow = await this.prisma.follows.findFirst({
				where: {
					follower: selfID,
					followee: followee.user_id,
				},
			});
			if (!follow) {
				return true;
			}

			await this.prisma.follows.delete({
				where: {
					follows_id: follow.follows_id,
					follower: selfID,
					followee: followee.user_id,
				},
			});
			return true;
		} catch (e) {
			throw new Error(
				"Failed to unfollow user with id: (" + followee.user_id + ")",
			);
		}
	}

	async getUserRooms(userID: string): Promise<RoomDto[]> {
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

	async createRoom(
		createRoomDto: CreateRoomDto,
		userID: string,
	): Promise<RoomDto> {
		const newRoom: Prisma.roomCreateInput = {
			name: createRoomDto.room_name || "Untitled Room",

			//foreign key relation for 'room_creator'
			users: {
				connect: {
					user_id: userID,
				},
			},
		};
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

		const room: PrismaTypes.room | null = await this.prisma.room.create({
			data: newRoom,
		});
		if (!room) {
			throw new Error("Something went wrong while creating the room");
		}

		//for is_private, we will need to add the roomID to the private_room tbale
		if (createRoomDto.is_private) {
			const privRoom: Prisma.private_roomCreateInput = {
				room: {
					connect: {
						room_id: room.room_id,
					},
				},
			};
			const privRoomResult = await this.prisma.private_room.create({
				data: privRoom,
			});
			if (!privRoomResult || privRoomResult === null) {
				throw new Error(
					"An unknown error occurred while creating private room. Received null.",
				);
			}
		} else {
			const pubRoom: Prisma.public_roomCreateInput = {
				room: {
					connect: {
						room_id: room.room_id,
					},
				},
			};
			const pubRoomResult = await this.prisma.public_room.create({
				data: pubRoom,
			});
			if (!pubRoomResult || pubRoomResult === null) {
				throw new Error(
					"An unknown error occurred while creating public room. Received null.",
				);
			}
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

		const result = await this.dtogen.generateRoomDtoFromRoom(room);
		if (!result) {
			throw new Error(
				"An unknown error occurred while generating RoomDto for created room. Received null.",
			);
		}
		return result;
	}

	async getRecentRooms(userID: string): Promise<string[]> {
		/*
		activity field in users table is modelled as:
		"{"recent_rooms": ["0352e8b8-e987-4dc9-a379-dc68b541e24f", "497d8138-13d2-49c9-808d-287b447448e8", "376578dd-9ef6-41cb-a9f6-2ded47e22c84", "62560ae5-9236-490c-8c75-c234678dc346"]}"
		*/
		// get the recent rooms from the user's activity field
		const u = await this.prisma.users.findUnique({
			where: { user_id: userID },
		});

		if (!u || u === null) {
			throw new Error("User does not exist");
		}

		const user: PrismaTypes.users = u;
		const activity: Prisma.JsonValue = user.activity;
		console.log(user);
		console.log(activity);
		if (!activity || activity === null) {
			return [];
		}

		if (typeof activity !== "object") {
			throw new Error(
				"An unknown error occurred while parsing the 'activity' field in 'users'. Expected object, received " +
					typeof activity,
			);
		}

		//if (!"recent_rooms" in activity) {
		if (!("recent_rooms" in activity)) {
			return [];
		}

		try {
			const recentRooms: string[] = activity["recent_rooms"] as string[];
			for (const roomID of recentRooms) {
				if (typeof roomID !== "string") {
					throw new Error(
						"An unknown error occurred while parsing the 'recent_rooms' field in 'activity'. Expected string[], received " +
							typeof roomID,
					);
				}
			}
			return recentRooms;
			/*
			const r = await this.dtogen.generateMultipleRoomDto(recentRooms);
			if (!r || r === null) {
				throw new Error(
					"An unknown error occurred while generating RoomDto for recent rooms. Received null.",
				);
			}
			return r;
			*/
		} catch (e) {
			throw new Error(
				"An unknown error occurred while parsing the 'recent_rooms' field in 'activity'. Expected string[], received " +
					typeof activity["recent_rooms"],
			);
		}
	}

	async getRecommendedRooms(userID: string): Promise<RoomDto[]> {
		//TODO: implement recommendation algorithm
		console.log("Getting recommended rooms for user " + userID);
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

	async getUserFriends(userID: string): Promise<UserDto[]> {
		const f = await this.prisma.friends.findMany({
			where: {
				AND: [
					{ OR: [{ friend1: userID }, { friend2: userID }] },
					{ is_pending: false },
				],
			},
		});
		console.log(f);
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
		let r = await this.dtogen.generateMultipleUserDto(ids);
		r = r.map((user) => {
			user.relationship = "friend";
			return user;
		});
		console.log(r);
		return r;
	}

	async getFollowers(userID: string): Promise<UserDto[]> {
		const f = await this.dbUtils.getUserFollowers(userID);
		if (!f) {
			return [];
		}
		const followers: PrismaTypes.users[] = f;
		const ids: string[] = followers.map((follower) => follower.user_id);
		let result = await this.dtogen.generateMultipleUserDto(ids);
		if (!result) {
			throw new Error(
				"An unknown error occurred while generating UserDto for followers. Received null.",
			);
		}

		result = await Promise.all(
			result.map(async (user) => {
				const relationship = await this.dbUtils.getRelationshipStatus(
					userID,
					user.userID,
				);
				user.relationship = relationship;
				return user;
			}),
		);
		return result;
	}

	async getFollowing(userID: string): Promise<UserDto[]> {
		const following = await this.dbUtils.getUserFollowing(userID);
		if (!following) {
			return [];
		}
		const followees: PrismaTypes.users[] = following;
		const ids: string[] = followees.map((followee) => followee.user_id);
		let result = await this.dtogen.generateMultipleUserDto(ids);
		if (!result) {
			throw new Error(
				"An unknown error occurred while generating UserDto for following. Received null.",
			);
		}
		result = await Promise.all(
			result.map(async (user) => {
				const relationship = await this.dbUtils.getRelationshipStatus(
					userID,
					user.userID,
				);
				user.relationship = relationship;
				return user;
			}),
		);
		return result;
	}

	async getBookmarks(userID: string): Promise<RoomDto[]> {
		if (!(await this.dbUtils.userExists(userID))) {
			throw new HttpException("User does not exist", HttpStatus.NOT_FOUND);
		}
		const bookmarks: PrismaTypes.bookmark[] =
			await this.prisma.bookmark.findMany({
				where: { user_id: userID },
			});

		const roomIDs: string[] = bookmarks.map((bookmark) => bookmark.room_id);
		const rooms = await this.dtogen.generateMultipleRoomDto(roomIDs);
		if (!rooms) {
			throw new Error(
				"An unknown error occurred while generating RoomDto for bookmarks. Received null.",
			);
		}
		return rooms;
	}

	async befriendUser(
		userID: string,
		newPotentialFriendUsername: string,
	): Promise<boolean> {
		//add friend request for the user
		console.log(
			"user (" +
				userID +
				") wants to befriend (@" +
				newPotentialFriendUsername +
				")",
		);

		// check if user exists
		if (!(await this.dbUtils.userExists(userID))) {
			throw new HttpException(
				"User (" + userID + ") does not exist",
				HttpStatus.NOT_FOUND,
			);
		}

		const potentialFriend = await this.prisma.users.findFirst({
			where: { username: newPotentialFriendUsername },
		});
		if (!potentialFriend) {
			throw new Error(
				"User (@" + newPotentialFriendUsername + ") does not exist",
			);
		}

		// check if user is trying to friend themselves
		if (userID === potentialFriend.user_id) {
			throw new HttpException(
				"You cannot friend yourself",
				HttpStatus.BAD_REQUEST,
			);
		}

		// check if they are already friends
		if (
			(await this.dbUtils.isFriendsOrPending(
				userID,
				potentialFriend.user_id,
				true,
			)) ||
			(await this.dbUtils.isFriendsOrPending(
				userID,
				potentialFriend.user_id,
				false,
			))
		) {
			throw new HttpException(
				"User (" +
					userID +
					") is already friends with (@" +
					newPotentialFriendUsername +
					") or has a pending request",
				HttpStatus.BAD_REQUEST,
			);
		}

		if (!(await this.dbUtils.isMutualFollow(userID, potentialFriend.user_id))) {
			throw new HttpException(
				"User (" +
					userID +
					") cannot befriend (@" +
					newPotentialFriendUsername +
					"). Users must follow each other first.",
				HttpStatus.BAD_REQUEST,
			);
		}
		const result = await this.prisma.friends.create({
			data: {
				friend1: userID,
				friend2: potentialFriend.user_id,
			},
		});

		if (!result || result === null) {
			throw new Error(
				"Failed to befriend user (@" +
					newPotentialFriendUsername +
					"). Database error.",
			);
		}
		return true;
	}

	async unfriendUser(userID: string, friendUsername: string): Promise<boolean> {
		//remove friend from the user's friend list
		console.log(
			"user (" +
				userID +
				") is no longer friends with (@" +
				friendUsername +
				")",
		);

		// check if user exists
		if (!(await this.dbUtils.userExists(userID))) {
			throw new HttpException(
				"User (" + userID + ") does not exist",
				HttpStatus.NOT_FOUND,
			);
		}

		const friend = await this.prisma.users.findFirst({
			where: { username: friendUsername },
		});
		if (!friend) {
			throw new Error("User (@" + friendUsername + ") does not exist");
		}

		// check if user is trying to unfriend themselves
		if (userID === friend.user_id) {
			throw new HttpException(
				"You cannot unfriend yourself",
				HttpStatus.BAD_REQUEST,
			);
		}

		//check if they are friends
		console.log("friend", friend);
		if (
			!(await this.dbUtils.isFriendsOrPending(userID, friend.user_id, false))
		) {
			throw new HttpException(
				"User (" + userID + ") is not friends with (" + friend.user_id + ")",
				HttpStatus.BAD_REQUEST,
			);
		}

		//delete the friendship
		const result = await this.prisma.friends.deleteMany({
			where: {
				OR: [
					{ friend1: userID, friend2: friend.user_id },
					{ friend1: friend.user_id, friend2: userID },
				],
			},
		});

		if (!result || result === null) {
			throw new Error(
				"Failed to unfriend user (" + friendUsername + "). Database error.",
			);
		}

		return true;
	}

	async acceptFriendRequest(
		userID: string,
		friendUsername: string,
	): Promise<boolean> {
		//accept friend request
		console.log(
			"user (" + userID + ") accepted friend request from @" + friendUsername,
		);

		// check if user exists
		if (!(await this.dbUtils.userExists(userID))) {
			throw new HttpException(
				"User (" + userID + ") does not exist",
				HttpStatus.NOT_FOUND,
			);
		}

		const friend = await this.prisma.users.findFirst({
			where: { username: friendUsername },
		});
		if (!friend) {
			throw new Error("User (@" + friendUsername + ") does not exist");
		}

		// check if user is trying to accept themselves
		if (userID === friend.user_id) {
			throw new HttpException(
				"You cannot accept yourself",
				HttpStatus.BAD_REQUEST,
			);
		}

		const result = await this.prisma.friends.updateMany({
			where: {
				friend1: friend.user_id,
				friend2: userID,
				is_pending: true,
			},
			data: {
				is_pending: false,
				date_friended: new Date(),
			},
		});
		console.log("accepted friend request", result);
		if (result.count === 0) {
			throw new HttpException(
				"User (@" +
					friendUsername +
					") has not sent a friend request to user (" +
					userID +
					")",
				HttpStatus.BAD_REQUEST,
			);
		}
		return true;
	}

	async rejectFriendRequest(
		userID: string,
		rejectedUsername: string,
	): Promise<boolean> {
		//reject friend request
		console.log(
			"user (" + userID + ") rejected friend request from @" + rejectedUsername,
		);

		// check if user exists
		if (!(await this.dbUtils.userExists(userID))) {
			throw new HttpException(
				"User (" + userID + ") does not exist",
				HttpStatus.NOT_FOUND,
			);
		}

		const friend = await this.prisma.users.findFirst({
			where: { username: rejectedUsername },
		});
		if (!friend) {
			throw new HttpException(
				"User (@" + rejectedUsername + ") does not exist",
				HttpStatus.NOT_FOUND,
			);
		}

		// check if user is trying to accept themselves
		if (userID === friend.user_id) {
			throw new HttpException(
				"You cannot reject yourself",
				HttpStatus.BAD_REQUEST,
			);
		}

		const rejectedRequest = await this.prisma.friends.deleteMany({
			where: {
				friend1: friend.user_id,
				friend2: userID,
				is_pending: true,
			},
		});
		if (rejectedRequest.count === 0) {
			throw new HttpException(
				"User (@" +
					rejectedUsername +
					") has not sent a friend request to user (" +
					userID +
					")",
				HttpStatus.BAD_REQUEST,
			);
		}
		return true;
	}

	async getFriendRequests(userID: string): Promise<UserDto[]> {
		//get all friend requests for the user
		console.log("Getting friend requests for user " + userID);

		/*
			DONT IGNORE THIS

			YOU HAVE TO USE generateUserDto() with the show_friendship flag set to true
			this adds the friendship status to the user object (which will contain info for accepting & rejecting friend requests)
		*/

		const friendRequests = await this.dbUtils.getFriendRequests(userID);
		if (!friendRequests) {
			return [];
		}
		const ids: string[] = friendRequests.map((friend) => friend.friend1);
		const result = await this.dtogen.generateMultipleUserDto(ids);
		if (!result) {
			throw new Error(
				"An unknown error occurred while generating UserDto for friend requests. Received null.",
			);
		}
		return result;
	}

	async getPotentialFriends(userID: string): Promise<UserDto[]> {
		//get all potential friends for the user
		console.log("Getting potential friends for user " + userID);
		const potentialFriends: PrismaTypes.users[] | null =
			await this.dbUtils.getPotentialFriends(userID);
		if (!potentialFriends) {
			return [];
		}
		const ids: string[] = potentialFriends.map(
			(friend: PrismaTypes.users) => friend.user_id,
		);
		const result: UserDto[] = await this.dtogen.generateMultipleUserDto(ids);
		if (!result) {
			throw new Error(
				"An unknown error occurred while generating UserDto for potential friends. Received null.",
			);
		}
		return result;
	}

	async getPendingRequests(userID: string): Promise<UserDto[]> {
		//get all pending friend requests for the user
		console.log("Getting pending friend requests for user " + userID);
		const pendingRequests: PrismaTypes.friends[] | null =
			await this.dbUtils.getPendingRequests(userID);
		if (!pendingRequests) {
			return [];
		}
		const ids: string[] = pendingRequests.map(
			(friend: PrismaTypes.friends) => friend.friend2,
		);
		const result: UserDto[] = await this.dtogen.generateMultipleUserDto(ids);
		if (!result) {
			throw new Error(
				"An unknown error occurred while generating UserDto for pending requests. Received null.",
			);
		}
		return result;
	}

	async cancelFriendRequest(
		userID: string,
		friendUsername: string,
	): Promise<boolean> {
		//cancel friend request
		console.log(
			"user (" + userID + ") cancelled friend request to @" + friendUsername,
		);
		// check if users exist
		if (!(await this.dbUtils.userExists(userID))) {
			throw new HttpException(
				"User (" + userID + ") does not exist",
				HttpStatus.NOT_FOUND,
			);
		}

		const friend: PrismaTypes.users | null = await this.prisma.users.findFirst({
			where: { username: friendUsername },
		});
		if (!friend) {
			throw new HttpException(
				"User (" + friendUsername + ") does not exist",
				HttpStatus.NOT_FOUND,
			);
		}
		if (userID === friend.user_id) {
			throw new HttpException(
				"You cannot cancel a friend request to yourself",
				HttpStatus.BAD_REQUEST,
			);
		}
		const cancelledRequest = await this.prisma.friends.deleteMany({
			where: {
				friend1: userID,
				friend2: friend.user_id,
				is_pending: true,
			},
		});
		if (cancelledRequest.count === 0) {
			throw new HttpException(
				"User (" +
					userID +
					") has not sent a friend request to user (" +
					friendUsername +
					")",
				HttpStatus.BAD_REQUEST,
			);
		}
		return true;
	}

	async getCurrentRoomDto(userID: string): Promise<RoomDto> {
		if (!(await this.dbUtils.userExists(userID))) {
			throw new HttpException("User does not exist", HttpStatus.BAD_REQUEST);
		}
		const room: ({ room: PrismaTypes.room } & PrismaTypes.participate) | null =
			await this.prisma.participate.findFirst({
				where: {
					user_id: userID,
				},
				include: {
					room: true,
				},
			});

		if (room === null) {
			throw new HttpException("User is not in a room", HttpStatus.NOT_FOUND);
		}
		const result: RoomDto | null = await this.dtogen.generateRoomDto(
			room.room.room_id,
		);
		if (!result) {
			throw new Error(
				"An unknown error occurred while generating RoomDto for current room. Received null.",
			);
		}
		return result;
	}

	async sendMessage(
		userID: string,
		message: DirectMessageDto,
	): Promise<DirectMessageDto> {
		//send message to user
		try {
			const newMessage = await this.prisma.message.create({
				data: {
					contents: message.messageBody,
					date_sent: message.dateSent,
					sender: message.sender.userID,
				},
			});
			const m: PrismaTypes.private_message =
				await this.prisma.private_message.create({
					data: {
						users: {
							connect: {
								user_id: message.recipient.userID,
							},
						},
						message: {
							connect: {
								message_id: newMessage.message_id,
							},
						},
					},
				});
			console.log("new DM: ");
			console.log(m);
			return await this.dtogen.generateDirectMessageDto(m.p_message_id);
		} catch (e) {
			throw new Error("Failed to send message");
		}
	}

	async getMessages(
		userID: string,
		recipientID: string,
	): Promise<DirectMessageDto[]> {
		//get messages between two users
		return this.dtogen.getChatAsDirectMessageDto(userID, recipientID);
	}

	async getUnreadMessages(
		userID: string,
		recipientID: string,
	): Promise<DirectMessageDto[]> {
		//get unread messages between two users
		return this.dtogen.getChatAsDirectMessageDto(userID, recipientID, true);
	}

	//count the number of chats with new messages
	async getNewMessageCount(userID: string, min: Date): Promise<number> {
		const dms: ({
			message: PrismaTypes.message;
		} & PrismaTypes.private_message)[] =
			await this.prisma.private_message.findMany({
				where: {
					recipient: userID,
					message: {
						date_sent: {
							gte: min,
						},
					},
				},
				include: {
					message: true,
				},
			});

		if (!dms || dms === null) {
			throw new Error(
				"An unexpected error occurred in the database. Could not fetch direct messages. DTOGenService.generateMultipleDirectMessageDto():ERROR01",
			);
		}

		//count number of unique senders
		const senders: string[] = [];
		for (let i = 0; i < dms.length; i++) {
			const dm = dms[i];
			if (dm && dm !== null) {
				if (!senders.includes(dm.message.sender)) {
					senders.push(dm.message.sender);
				}
			}
		}
		return senders.length;
	}

	async getUserNewMessages(
		userID: string,
		min: Date,
	): Promise<DirectMessageDto[]> {
		const self: UserDto = await this.dtogen.generateUserDto(userID);
		const dms: ({
			message: PrismaTypes.message;
		} & PrismaTypes.private_message)[] =
			await this.prisma.private_message.findMany({
				where: {
					recipient: userID,
					message: {
						date_sent: {
							gt: min,
						},
					},
				},
				include: {
					message: true,
				},
			});

		if (!dms || dms === null) {
			throw new Error(
				"An unexpected error occurred in the database. Could not fetch direct messages. DTOGenService.generateMultipleDirectMessageDto():ERROR01",
			);
		}

		//sort messages by date
		dms.sort((a, b) => {
			return a.message.date_sent.getTime() - b.message.date_sent.getTime();
		});

		const result: DirectMessageDto[] = [];
		for (let i = 0; i < dms.length; i++) {
			const dm = dms[i];
			if (dm && dm !== null) {
				const sender: UserDto = await this.dtogen.generateUserDto(
					dm.message.sender,
				);
				const index: number = await this.dbUtils.getDMIndex(
					userID,
					dm.message.sender,
					dm.p_message_id,
				);
				const message: DirectMessageDto = {
					index: index,
					messageBody: dm.message.contents,
					sender: sender,
					recipient: self,
					dateSent: dm.message.date_sent,
					dateRead: new Date(0),
					isRead: false,
					pID: dm.p_message_id,
				};
				result.push(message);
			}
		}
		return result;
	}

	async getNewMessages(userID: string): Promise<DirectMessageDto[]> {
		//get new messages for the user
		const lastRead: Date = new Date(0);
		return await this.getUserNewMessages(userID, lastRead);
	}

	async markMessagesAsRead(
		userID: string,
		messages: DirectMessageDto[],
	): Promise<boolean> {
		//mark multiple messages as read
		try {
			console.log(
				`Marking ${messages.length} messages as read for user ` + userID,
			);

			/*
			await this.prisma.private_message.updateMany({
				where: {
					recipient: userID,
					message: {
						message_id: {
							in: messages.map((m) => m.pID),
						},
					},
				},
				data: {
					is_read: true,
				},
			});
			*/
			return true;
		} catch (e) {
			console.error(e);
			throw e;
		}
	}

	async deleteMessage(
		userID: string,
		message: DirectMessageDto,
	): Promise<boolean> {
		//delete a message
		try {
			await this.prisma.message.delete({
				where: { message_id: message.pID },
			});
			return true;
		} catch (e) {
			console.error(e);
			throw e;
		}
	}

	async editMessage(
		userID: string,
		message: DirectMessageDto,
	): Promise<DirectMessageDto> {
		//edit a message
		try {
			const updatedMessage:
				| ({
						message: PrismaTypes.message;
				  } & PrismaTypes.private_message)
				| null = await this.prisma.private_message.update({
				where: {
					p_message_id: message.pID,
				},
				data: {
					message: {
						update: {
							contents: message.messageBody,
						},
					},
				},
				include: {
					message: true,
				},
			});
			if (!updatedMessage || updatedMessage === null) {
				throw new Error("Failed to update message");
			}
			return await this.dtogen.generateDirectMessageDto(
				updatedMessage.p_message_id,
			);
		} catch (e) {
			console.error(e);
			throw e;
		}
	}

	async generateChatHash(
		userID: string,
		recipientID: string,
	): Promise<string[]> {
		//generate a unique chat hash
		const chatStr1 = userID + recipientID;
		const chatStr2 = recipientID + userID;
		const a = this.dbUtils.generateHash(chatStr1);
		const b = this.dbUtils.generateHash(chatStr2);
		return Promise.all([a, b]);
	}

	async getLastDMs(userID: string): Promise<DirectMessageDto[]> {
		//get the last few messages for the user
		const dms: ({
			message: PrismaTypes.message;
		} & PrismaTypes.private_message)[] =
			await this.prisma.private_message.findMany({
				where: {
					OR: [
						{
							recipient: userID,
						},
						{
							message: {
								sender: userID,
							},
						},
					],
				},
				include: {
					message: true,
				},
			});

		if (!dms || dms === null) {
			throw new Error(
				"An unexpected error occurred in the database. Could not fetch direct messages. DTOGenService.generateMultipleDirectMessageDto():ERROR01",
			);
		}

		const uniqueUserIDs: Map<string, boolean> = new Map<string, boolean>();
		for (let i = 0; i < dms.length; i++) {
			const dm = dms[i];
			if (dm) {
				if (dm.message.sender !== userID) {
					if (!uniqueUserIDs.has(dm.message.sender)) {
						uniqueUserIDs.set(dm.message.sender, false);
					}
				} else if (dm.recipient !== userID) {
					if (!uniqueUserIDs.has(dm.recipient)) {
						uniqueUserIDs.set(dm.recipient, false);
					}
				}
			}
		}

		//sort messages by date (newest first)
		dms.sort((a, b) => {
			return b.message.date_sent.getTime() - a.message.date_sent.getTime();
		});

		const chats: ({
			message: PrismaTypes.message;
		} & PrismaTypes.private_message)[] = [];
		for (let i = 0; i < dms.length; i++) {
			const dm = dms[i];
			if (dm) {
				const recipient: string = dm.recipient;
				const sender: string = dm.message.sender;
				const r = uniqueUserIDs.get(recipient);
				const s = uniqueUserIDs.get(sender);
				if (r !== undefined && r === false) {
					uniqueUserIDs.set(recipient, true);
					chats.push(dm);
				} else if (s !== undefined && s === false) {
					uniqueUserIDs.set(sender, true);
					chats.push(dm);
				}
			}
		}
		const result: DirectMessageDto[] =
			await this.dtogen.generateMultipleDirectMessageDto(chats);
		return result;
	}

	async blockUser(userID: string, usernameToBlock: string): Promise<void> {
		console.log(
			"Blocking user with id: " + userID + " is blocking " + usernameToBlock,
		);
		if (true) {
			//if user does not exist
			throw new HttpException("User is already blocked", HttpStatus.NOT_FOUND);
		}
	}

	async unblockUser(userID: string, usernameToUnblock: string): Promise<void> {
		console.log(
			"Unblocking user with id: " +
				userID +
				" is unblocking " +
				usernameToUnblock,
		);
		if (true) {
			//if user does not exist
			throw new HttpException("User was not blocked", HttpStatus.NOT_FOUND);
		}
	}

	async getBlockedUsers(userID: string): Promise<UserDto[]> {
		if (true) {
			//if user does not exist
			throw new HttpException("User does not exist", HttpStatus.NOT_FOUND);
		}
		return [];
	}

	async reportUser(userID: string, usernameToReport: string): Promise<void> {
		console.log(
			"Reporting user with id: " + userID + " is reporting " + usernameToReport,
		);
		if (true) {
			//if user does not exist
			throw new HttpException("User does not exist", HttpStatus.NOT_FOUND);
		}

		//if user has been reported 5x, delete their account
	}

	async getListeningStats(userID: string): Promise<UserListeningStatsDto> {
		const user = await this.prisma.users.findUnique({
			where: { user_id: userID },
		});

		if (!user) {
			throw new Error("User does not exist");
		}

		const stats: UserListeningStatsDto = {
			totalListenedSongs: 0,
		};
		return stats;
	}
}
