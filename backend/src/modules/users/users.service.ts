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
import { DirectMessageDto } from "./dto/dm.dto";
import { RecommenderService } from "src/recommender/recommender.service";

@Injectable()
export class UsersService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly dbUtils: DbUtilsService,
		private readonly dtogen: DtoGenService,
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

	async getCurrentRoom(userID: string): Promise<RoomDto | object> {
		console.log("Getting current room for user " + userID);
		return {};
	}

	async getUserFriends(userID: string): Promise<UserDto[]> {
		const f = await this.prisma.friends.findMany({
			where: { OR: [{ friend1: userID }, { friend2: userID }] },
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
		const r = await this.dtogen.generateMultipleUserDto(ids);
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
		const result = await this.dtogen.generateMultipleUserDto(ids);
		if (!result) {
			throw new Error(
				"An unknown error occurred while generating UserDto for followers. Received null.",
			);
		}
		return result;
	}

	async getFollowing(userID: string): Promise<UserDto[]> {
		const following = await this.dbUtils.getUserFollowing(userID);
		if (!following) {
			return [];
		}
		const followees: PrismaTypes.users[] = following;
		const ids: string[] = followees.map((followee) => followee.user_id);
		const result = await this.dtogen.generateMultipleUserDto(ids);
		if (!result) {
			throw new Error(
				"An unknown error occurred while generating UserDto for following. Received null.",
			);
		}
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
		return [];
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

		//sort messages by date (newest first)
		dms.sort((a, b) => {
			return b.message.date_sent.getTime() - a.message.date_sent.getTime();
		});

		const chats: ({
			message: PrismaTypes.message;
		} & PrismaTypes.private_message)[] = [];
		for (let i = 0; i < dms.length; i++) {
			const dm = dms[i];
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
		const result: DirectMessageDto[] =
			await this.dtogen.generateMultipleDirectMessageDto(chats);
		return result;
	}
}
