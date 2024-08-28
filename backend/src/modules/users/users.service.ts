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
import { CreateUserDto } from "./dto/create-user.dto";
import { RecommenderService } from "src/recommender/recommender.service";

@Injectable()
export class UsersService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly dbUtils: DbUtilsService,
		private readonly dtogen: DtoGenService,
		private recommender: RecommenderService,
	) {}

	// Tutorial CRUD operations
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

		const updateData = this.dbUtils.buildUpdateData(user, updateProfileDto);

		await this.prisma.users.update({
			where: { user_id: userId },
			data: updateData,
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
	async followUser(
		userId: string,
		accountFollowedId: string,
	): Promise<boolean> {
		if (userId === accountFollowedId) {
			throw new Error("You cannot follow yourself");
		}

		if (!(await this.dbUtils.userExists(accountFollowedId))) {
			throw new Error("User (" + accountFollowedId + ") does not exist");
		}

		if (!(await this.dbUtils.userExists(userId))) {
			throw new Error("User (" + userId + ") does not exist");
		}

		if (await this.dbUtils.isFollowing(userId, accountFollowedId)) {
			return true;
		}

		try {
			await this.prisma.follows.create({
				data: {
					follower: userId,
					followee: accountFollowedId,
				},
			});
			return true;
		} catch (e) {
			throw new Error("Failed to follow user (" + accountFollowedId + ")");
		}
	}

	/*
	follower: the person who does the following
	followee (leader): the person being followed
	*/
	async unfollowUser(
		userId: string,
		accountUnfollowedId: string,
	): Promise<boolean> {
		if (userId === accountUnfollowedId) {
			throw new Error("You cannot unfollow yourself");
		}

		if (!(await this.dbUtils.userExists(accountUnfollowedId))) {
			throw new Error("User (" + accountUnfollowedId + ") does not exist");
		}

		if (!(await this.dbUtils.userExists(userId))) {
			throw new Error("User (" + userId + ") does not exist");
		}

		if (!(await this.dbUtils.isFollowing(userId, accountUnfollowedId))) {
			return true;
		}

		try {
			//find the follow relationship and delete it
			const follow = await this.prisma.follows.findFirst({
				where: {
					follower: userId,
					followee: accountUnfollowedId,
				},
			});
			if (!follow) {
				return true;
			}

			await this.prisma.follows.delete({
				where: {
					follows_id: follow.follows_id,
					follower: userId,
					followee: accountUnfollowedId,
				},
			});
			return true;
		} catch (e) {
			throw new Error("Failed to unfollow user (" + accountUnfollowedId + ")");
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

	async getRecentRooms(userID: string): Promise<RoomDto[]> {
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
			const r = await this.dtogen.generateMultipleRoomDto(recentRooms);
			if (!r || r === null) {
				throw new Error(
					"An unknown error occurred while generating RoomDto for recent rooms. Received null.",
				);
			}
			return r;
		} catch (e) {
			throw new Error(
				"An unknown error occurred while parsing the 'recent_rooms' field in 'activity'. Expected string[], received " +
					typeof activity["recent_rooms"],
			);
		}
	}

	async getRecommendedRooms(userID: string): Promise<RoomDto[]> {
		//TODO: implement recommendation algorithm
		// const recommender: RecommenderService = new RecommenderService();
		const rooms: PrismaTypes.room[] = await this.prisma.room.findMany();

		const roomsWithSongs: any = await Promise.all(
			rooms.map(async (room: any) => {
				const songs: any = await this.dbUtils.getRoomSongs(room.room_id);
				room.songs = songs;
				return room;
			}),
		);

		// create an object of all the room songs with the key being room_id and the value being the songs
		const roomSongs = roomsWithSongs.reduce((acc: any, room: any) => {
			acc[room.room_id] = room.songs.map((song: any) => song.audio_features);
			return acc;
		}, {});
		console.log("roomSongs:", roomSongs);
		const favoriteSongs: any = await this.dbUtils.getUserFavoriteSongs(userID);
		// const favoriteSongs: any[] = [];
		console.log("favoriteSongs:", favoriteSongs);
		this.recommender.setMockSongs(
			favoriteSongs.map((song: any) => song.audio_features),
		);
		this.recommender.setPlaylists(roomSongs);
		const recommendedRooms = this.recommender.getTopPlaylists(5);
		console.log("recommendedRooms:", recommendedRooms);
		const r: RoomDto[] | null = await this.dtogen.generateMultipleRoomDto(
			recommendedRooms.map((room: any) => room.playlist),
		);
		return r === null ? [] : r;
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
		newPotentialFriendID: string,
	): Promise<boolean> {
		//add friend request for the user
		console.log(
			"user (" + userID + ") wants to befriend (" + newPotentialFriendID + ")",
		);

		// check if user is trying to friend themselves
		if (userID === newPotentialFriendID) {
			throw new HttpException(
				"You cannot friend yourself",
				HttpStatus.BAD_REQUEST,
			);
		}

		// check if users exist
		if (!(await this.dbUtils.userExists(userID))) {
			throw new HttpException(
				"User (" + userID + ") does not exist",
				HttpStatus.NOT_FOUND,
			);
		}
		// check if friend exists as a user
		if (!(await this.dbUtils.userExists(newPotentialFriendID))) {
			throw new HttpException(
				"User (" + newPotentialFriendID + ") does not exist",
				HttpStatus.NOT_FOUND,
			);
		}

		// check if they are already friends
		if (
			(await this.dbUtils.isFriendsOrPending(
				userID,
				newPotentialFriendID,
				true,
			)) ||
			(await this.dbUtils.isFriendsOrPending(
				userID,
				newPotentialFriendID,
				false,
			))
		) {
			throw new HttpException(
				"User (" +
					userID +
					") is already friends with (" +
					newPotentialFriendID +
					") or has a pending request",
				HttpStatus.BAD_REQUEST,
			);
		}

		if (!(await this.dbUtils.isMutualFollow(userID, newPotentialFriendID))) {
			throw new HttpException(
				"User (" + userID + ") cannot befriend (" + newPotentialFriendID + ")",
				HttpStatus.BAD_REQUEST,
			);
		}
		const result = await this.prisma.friends.create({
			data: {
				friend1: userID,
				friend2: newPotentialFriendID,
			},
		});

		if (!result || result === null) {
			throw new Error("Failed to befriend user (" + newPotentialFriendID + ")");
		}
		return true;
	}

	async unfriendUser(userID: string, friendUserID: string): Promise<boolean> {
		//remove friend from the user's friend list
		console.log(
			"user (" + userID + ") is no longer friends with (" + friendUserID + ")",
		);

		// check if user is trying to unfriend themselves
		if (userID === friendUserID) {
			throw new HttpException(
				"You cannot unfriend yourself",
				HttpStatus.BAD_REQUEST,
			);
		}

		//check if the user exists
		if (!(await this.dbUtils.userExists(userID))) {
			throw new HttpException(
				"User (" + userID + ") does not exist",
				HttpStatus.NOT_FOUND,
			);
		}
		if (!(await this.dbUtils.userExists(friendUserID))) {
			throw new HttpException(
				"User (" + friendUserID + ") does not exist",
				HttpStatus.NOT_FOUND,
			);
		}

		//check if they are friends
		if (!(await this.dbUtils.isFriendsOrPending(userID, friendUserID, false))) {
			throw new HttpException(
				"User (" + userID + ") is not friends with (" + friendUserID + ")",
				HttpStatus.BAD_REQUEST,
			);
		}

		//delete the friendship
		const result = await this.prisma.friends.deleteMany({
			where: {
				OR: [
					{ friend1: userID, friend2: friendUserID },
					{ friend1: friendUserID, friend2: userID },
				],
			},
		});

		if (!result || result === null) {
			throw new Error("Failed to unfriend user (" + friendUserID + ")");
		}

		return true;
	}

	async acceptFriendRequest(
		userID: string,
		friendUserID: string,
	): Promise<boolean> {
		//accept friend request
		console.log(
			"user (" + userID + ") accepted friend request from @" + friendUserID,
		);

		// check if user is trying to accept themselves
		if (userID === friendUserID) {
			throw new HttpException(
				"You cannot accept yourself",
				HttpStatus.BAD_REQUEST,
			);
		}
		// check if users exist
		if (!(await this.dbUtils.userExists(userID))) {
			throw new HttpException(
				"User (" + userID + ") does not exist",
				HttpStatus.NOT_FOUND,
			);
		}
		if (!(await this.dbUtils.userExists(friendUserID))) {
			throw new HttpException(
				"User (" + friendUserID + ") does not exist",
				HttpStatus.NOT_FOUND,
			);
		}
		const result = await this.prisma.friends.updateMany({
			where: {
				friend1: friendUserID,
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
				"User (" +
					friendUserID +
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
		friendUserID: string,
	): Promise<boolean> {
		//reject friend request
		console.log(
			"user (" + userID + ") rejected friend request from @" + friendUserID,
		);
		if (userID === friendUserID) {
			throw new HttpException(
				"You cannot reject yourself",
				HttpStatus.BAD_REQUEST,
			);
		}
		// check if users exist
		if (!(await this.dbUtils.userExists(userID))) {
			throw new HttpException(
				"User (" + userID + ") does not exist",
				HttpStatus.NOT_FOUND,
			);
		}
		if (!(await this.dbUtils.userExists(friendUserID))) {
			throw new HttpException(
				"User (" + friendUserID + ") does not exist",
				HttpStatus.NOT_FOUND,
			);
		}
		const rejectedRequest = await this.prisma.friends.deleteMany({
			where: {
				friend1: friendUserID,
				friend2: userID,
				is_pending: true,
			},
		});
		if (rejectedRequest.count === 0) {
			throw new HttpException(
				"User (" +
					friendUserID +
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

		const ids: string[] = friendRequests.map((friend: any) => friend.friend1);
		const result = await this.dtogen.generateMultipleUserDto(ids);
		if (!result) {
			throw new Error(
				"An unknown error occurred while generating UserDto for friend requests. Received null.",
			);
		}
		return result;
	}
	async getCurrentRoom(userID: string): Promise<PrismaTypes.room | null> {
		if (!(await this.dbUtils.userExists(userID))) {
			throw new HttpException("User does not exist", HttpStatus.NOT_FOUND);
		}
		const room: any = await this.prisma.participate.findFirst({
			where: {
				user_id: userID,
			},
			include: {
				room: true,
			},
		});

		if (room !== null) {
			room.room = await this.dtogen.generateRoomDto(room.room.room_id);
		}

		// if the user is in a room, get the join time from the user_activity table.
		// do the query on user id and retrieve the activity with a leave date of null
		// if the user is not in a room, return null
		if (room === null) {
			throw new HttpException("User is not in a room", HttpStatus.NOT_FOUND);
		}
		const userActivity: any = await this.prisma.user_activity.findFirst({
			where: {
				user_id: userID,
				room_id: room.room_id,
				room_leave_time: null,
			},
		});
		// add the join date to the returned object
		try {
			room.room_join_time = userActivity.room_join_time;
		} catch (error) {
			console.error("Error getting room join time:", error);
			throw new HttpException(
				"Error getting room join time",
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}
		return room;
	}

	async getPotentialFriends(userID: string): Promise<UserDto[]> {
		//get all potential friends for the user
		console.log("Getting potential friends for user " + userID);
		const potentialFriends = await this.dbUtils.getPotentialFriends(userID);
		if (!potentialFriends) {
			return [];
		}
		const ids: string[] = potentialFriends.map((friend: any) => friend.user_id);
		const result = await this.dtogen.generateMultipleUserDto(ids);
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
		const ids: string[] = pendingRequests.map((friend) => friend.friend2);
		const result = await this.dtogen.generateMultipleUserDto(ids);
		if (!result) {
			throw new Error(
				"An unknown error occurred while generating UserDto for pending requests. Received null.",
			);
		}
		return result;
	}

	async cancelFriendRequest(
		userID: string,
		friendUserID: string,
	): Promise<boolean> {
		//cancel friend request
		console.log(
			"user (" + userID + ") cancelled friend request to @" + friendUserID,
		);
		if (userID === friendUserID) {
			throw new HttpException(
				"You cannot cancel a friend request to yourself",
				HttpStatus.BAD_REQUEST,
			);
		}
		// check if users exist
		if (!(await this.dbUtils.userExists(userID))) {
			throw new HttpException(
				"User (" + userID + ") does not exist",
				HttpStatus.NOT_FOUND,
			);
		}
		if (!(await this.dbUtils.userExists(friendUserID))) {
			throw new HttpException(
				"User (" + friendUserID + ") does not exist",
				HttpStatus.NOT_FOUND,
			);
		}
		const cancelledRequest = await this.prisma.friends.deleteMany({
			where: {
				friend1: userID,
				friend2: friendUserID,
				is_pending: true,
			},
		});
		if (cancelledRequest.count === 0) {
			throw new HttpException(
				"User (" +
					userID +
					") has not sent a friend request to user (" +
					friendUserID +
					")",
				HttpStatus.BAD_REQUEST,
			);
		}
		return true;
	}
}
