import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { PrismaService } from "../../../prisma/prisma.service";
//import Prisma from "@prisma/client";
import * as PrismaTypes from "@prisma/client";
import { SongInfoDto } from "../rooms/dto/songinfo.dto";
import * as bcrypt from "bcrypt";
import { ConfigService } from "@nestjs/config";

export type FullyQualifiedRoom = {
	child_room_child_room_parent_room_idToroom: PrismaTypes.child_room[];
	participate: PrismaTypes.participate[];
	private_room: PrismaTypes.private_room | null;
	public_room: PrismaTypes.public_room | null;
	scheduled_room: PrismaTypes.scheduled_room | null;
} & PrismaTypes.room;

export type UserWithAuth = {
	authentication: PrismaTypes.authentication | null;
} & PrismaTypes.users;

@Injectable()
export class DbUtilsService {
	private salt: string;

	constructor(
		private configService: ConfigService,
		private prisma: PrismaService,
	) {
		// Set the salt for hashing
		const salt = this.configService.get<string>("SALT");
		if (!salt) {
			throw new Error("Missing SALT");
		}
		this.salt = salt;
	}

	async getUsersWithAuth(userIDs: string[]): Promise<UserWithAuth[]> {
		return await this.prisma.users.findMany({
			where: { user_id: { in: userIDs } },
			include: { authentication: true },
		});
	}

	//get user following (people the user is following)
	/*
		follower: the person who does the following
		followee (leader): the person being followed
	*/
	async getUserFollowing(userID: string): Promise<UserWithAuth[]> {
		return await this.prisma.users.findMany({
			where: {
				follows_follows_followerTousers: {
					every: {
						follower: userID,
					},
				},
			},
			include: { authentication: true },
		}); // people userID is following
	}

	//get user followers (people following the user)
	/*
		follower: the person who does the following
		followee (leader): the person being followed
	*/
	async getUserFollowers(userID: string): Promise<UserWithAuth[]> {
		return await this.prisma.users.findMany({
			where: {
				follows_follows_followeeTousers: {
					some: {
						followee: userID,
					},
				},
			},
			include: { authentication: true },
		}); // people following userID
	}

	async getUserFollowersAndFollowing(userID: string): Promise<{
		following: UserWithAuth[];
		followers: UserWithAuth[];
	}> {
		const result: UserWithAuth[][] = await this.prisma.$transaction([
			this.prisma.users.findMany({
				where: {
					follows_follows_followeeTousers: {
						every: {
							followee: userID,
						},
					},
				},
				include: { authentication: true },
			}), // people following userID
			this.prisma.users.findMany({
				where: {
					follows_follows_followerTousers: {
						every: {
							follower: userID,
						},
					},
				},
				include: { authentication: true },
			}), // people userID is following
		]);
		return {
			following: result[0],
			followers: result[1],
		};
	}

	async getUserFollowersAndFollowingCount(userID: string): Promise<{
		following: number;
		followers: number;
	}> {
		const result: number[] = await this.prisma.$transaction([
			this.prisma.users.count({
				where: {
					follows_follows_followeeTousers: {
						every: {
							followee: userID,
						},
					},
				},
			}), // number of people following userID
			this.prisma.users.count({
				where: {
					follows_follows_followerTousers: {
						every: {
							follower: userID,
						},
					},
				},
			}), // number of people userID is following
		]);
		return {
			following: result[0],
			followers: result[1],
		};
	}

	getLinks(user: PrismaTypes.users): {
		count: number;
		data: Record<string, string[]>;
	} {
		if (JSON.stringify(user.external_links || {}) === "{}") {
			return { count: 0, data: {} };
		}

		try {
			// Parse the JSON string
			const links = JSON.parse(JSON.stringify(user.external_links));
			const totalLinks = Object.values(links).flat().length; // Flatten the arrays into a single array

			// Ensure the parsed object has the required properties
			if (links && typeof links === "object") {
				return {
					count: totalLinks,
					data: links,
				};
			} else {
				throw new Error("Invalid links format");
			}
		} catch (error) {
			console.error("Failed to parse external_links: ", error);
			return { count: 0, data: {} };
		}
	}

	async getPreferences(user: PrismaTypes.users): Promise<{
		fav_genres: { count: number; data: string[] };
		fav_songs: { count: number; data: SongInfoDto[] };
	}> {
		if (!user.preferences) {
			return {
				fav_genres: { count: 0, data: [] },
				fav_songs: { count: 0, data: [] },
			};
		}

		try {
			// Parse the JSON string
			const preferences = JSON.parse(JSON.stringify(user.preferences));
			// console.log(preferences);

			// Ensure the parsed object has the required properties
			if (
				preferences &&
				typeof preferences === "object" &&
				"fav_genres" in preferences &&
				"fav_songs" in preferences
			) {
				return {
					fav_genres: {
						count: preferences.fav_genres.length,
						data: preferences.fav_genres,
					},
					fav_songs: {
						count: preferences.fav_songs.length,
						data: preferences.fav_songs,
					},
				};
			} else {
				throw new Error("Invalid preferences format");
			}
		} catch (error) {
			console.error("Failed to parse preferences: ", error);
			return {
				fav_genres: { count: 0, data: [] },
				fav_songs: { count: 0, data: [] },
			};
		}
	}

	getActivity(user: PrismaTypes.users): { count: number; data: string[] } {
		if (!user.activity) {
			return {
				count: 0,
				data: [],
			};
		}

		try {
			// Parse the JSON string
			const activity = JSON.parse(JSON.stringify(user.activity));

			// Ensure the parsed object has the required properties
			if (typeof activity === "object" && "recent_rooms" in activity) {
				return {
					count: activity.recent_rooms.length,
					data: activity.recent_rooms,
				};
			} else {
				throw new Error("Invalid activity format");
			}
		} catch (error) {
			console.error("Failed to parse activity: ", error);
			return {
				count: 0,
				data: [],
			};
		}
	}

	async getFullyQualifiedRooms(
		roomIDs: string[],
	): Promise<FullyQualifiedRoom[]> {
		return await this.prisma.room.findMany({
			where: {
				room_id: {
					in: roomIDs,
				},
			},
			include: {
				child_room_child_room_parent_room_idToroom: true,
				participate: true,
				private_room: true,
				public_room: true,
				scheduled_room: true,
			},
		});
	}

	async getRandomRooms(count: number): Promise<PrismaTypes.room[]> {
		const rooms: PrismaTypes.room[] = await this.prisma.room.findMany();

		if (rooms.length <= count) {
			return rooms;
		}

		const result: PrismaTypes.room[] = [];
		while (result.length < count) {
			const random = Math.floor(Math.random() * rooms.length);
			const randomRoom = rooms[random];
			if (randomRoom && !result.includes(randomRoom)) {
				result.push(randomRoom);
			}
		}
		return rooms;
	}

	async isRoomPublic(roomID: string): Promise<boolean> {
		const room: PrismaTypes.room | null = await this.prisma.room.findUnique({
			where: { room_id: roomID },
		});
		if (!room || room === null) {
			throw new Error("Room not found. Probably doesn't exist.");
		}

		const publicRoom: PrismaTypes.public_room | null =
			await this.prisma.public_room.findUnique({
				where: { room_id: roomID },
			});

		if (!publicRoom || publicRoom === null) {
			return false;
		}

		return true;
	}

	async isRoomPrivate(roomID: string): Promise<boolean> {
		const room: PrismaTypes.room | null = await this.prisma.room.findUnique({
			where: { room_id: roomID },
		});
		if (!room || room === null) {
			throw new Error("Room not found. Probably doesn't exist.");
		}

		const privateRoom: PrismaTypes.private_room | null =
			await this.prisma.private_room.findUnique({
				where: { room_id: roomID },
			});

		if (!privateRoom || privateRoom === null) {
			return false;
		}

		return true;
	}

	async userExists(userID: string): Promise<boolean> {
		const user: PrismaTypes.users | null = await this.prisma.users.findUnique({
			where: { user_id: userID },
		});
		if (!user || user === null) {
			return false;
		}
		return true;
	}

	async usersExist(
		userIDs: string[],
	): Promise<{ userID: string; exists: boolean }[]> {
		const user: PrismaTypes.users[] = await this.prisma.users.findMany({
			where: { user_id: { in: userIDs } },
		});
		return userIDs.map((id) => {
			return {
				userID: id,
				exists: user.find((u) => u.user_id === id) !== undefined,
			};
		});
	}

	async roomExists(roomID: string): Promise<boolean> {
		const room: PrismaTypes.room | null = await this.prisma.room.findUnique({
			where: { room_id: roomID },
		});
		if (!room || room === null) {
			return false;
		}
		return true;
	}

	/*
	follower: the person who does the following
	followee (leader): the person being followed
	*/
	async isFollowing(
		userID: string,
		accountFollowedId: string,
	): Promise<boolean> {
		const follow: PrismaTypes.follows[] = await this.prisma.follows.findMany({
			where: {
				follower: userID,
				followee: accountFollowedId,
			},
		});
		console.log("Follow: ", follow);
		if (!follow || follow === null) {
			return false;
		}
		if (follow.length === 0) {
			return false;
		}
		if (follow.length > 1) {
			throw new Error("More than one follow found.");
		}
		return true;
	}

	async getFriendRequests(userID: string): Promise<PrismaTypes.friends[]> {
		const friendRequests: PrismaTypes.friends[] =
			await this.prisma.friends.findMany({
				where: {
					friend2: userID,
					is_pending: true,
				},
			});
		return friendRequests;
	}

	async getPendingRequests(userID: string): Promise<PrismaTypes.friends[]> {
		const pendingRequests: PrismaTypes.friends[] =
			await this.prisma.friends.findMany({
				where: {
					friend1: userID,
					is_pending: true,
				},
			});
		return pendingRequests;
	}

	// get users who aren't friends with the user, but are mutual followers
	async getPotentialFriends(userID: string): Promise<PrismaTypes.users[]> {
		const follows: PrismaTypes.follows[] = await this.prisma.follows.findMany({
			where: { OR: [{ follower: userID }, { followee: userID }] },
		});

		const following = follows.filter((f) => f.follower === userID);
		const followers = follows.filter((f) => f.followee === userID);

		const followingIDs: string[] = [];
		for (let i = 0; i < following.length; i++) {
			const f = following[i];
			if (f && f !== null) {
				if (f.followee && f.followee !== null) {
					followingIDs.push(f.followee);
				}
			}
		}

		const followerIDs: string[] = [];
		for (let i = 0; i < followers.length; i++) {
			const f = followers[i];
			if (f && f !== null) {
				if (f.follower && f.follower !== null) {
					followerIDs.push(f.follower);
				}
			}
		}

		const mutualFollowers: string[] = followingIDs.filter(
			(id) => followerIDs.includes(id) && id !== userID,
		);

		// potential friends are users who are mutual followers but not friends
		const potentialFriends: PrismaTypes.users[] = [];
		for (let i = 0; i < mutualFollowers.length; i++) {
			const id: string | undefined = mutualFollowers[i];
			if (id === undefined) {
				continue;
			}
			console.log("ID: ", id);
			if (!(await this.isFriendsOrPending(userID, id))) {
				const user: PrismaTypes.users | null =
					await this.prisma.users.findUnique({
						where: { user_id: id },
					});
				if (user && user !== null) {
					potentialFriends.push(user);
				}
			}
		}
		return potentialFriends;
	}

	async getRelationshipStatus(
		userID: string,
		accountFriendId: string,
	): Promise<
		"following" | "follower" | "mutual" | "friend" | "pending" | "none"
	> {
		// check if user is following accountFriendId
		const following: boolean = await this.isFollowing(userID, accountFriendId);

		// check if accountFriendId is following user
		const follower: boolean = await this.isFollowing(accountFriendId, userID);

		// check if user is friends with accountFriendId
		const friends: boolean = await this.isFriendsOrPending(
			userID,
			accountFriendId,
			false,
		);

		// check if user has a pending friend request from accountFriendId
		const pending: boolean = await this.isFriendsOrPending(
			userID,
			accountFriendId,
			true,
		);

		if (friends) {
			return "friend";
		} else if (pending) {
			return "pending";
		} else if (following && follower) {
			return "mutual";
		} else if (following) {
			return "following";
		} else if (follower) {
			return "follower";
		} else {
			return "none";
		}
	}

	async generateHash(input: string): Promise<string> {
		const hash = await bcrypt.hash(input, this.salt);
		return hash;
	}

	async getDMIndex(
		participant1: string,
		participant2: string,
		messageID: string,
	): Promise<number> {
		const dms: ({
			message: PrismaTypes.message;
		} & PrismaTypes.private_message)[] =
			await this.prisma.private_message.findMany({
				where: {
					OR: [
						{
							AND: [
								{ message: { sender: participant1 } },
								{ recipient: participant2 },
							],
						},
						{
							AND: [
								{ message: { sender: participant2 } },
								{ recipient: participant1 },
							],
						},
					],
				},
				include: {
					message: true,
				},
			});

		if (!dms || dms === null) {
			throw new Error(
				"An unexpected error occurred in the database. Could not fetch direct messages. DbUtilsService.getDMIndex():ERROR01",
			);
		}

		const index = dms.findIndex(
			(dm) =>
				dm.p_message_id === messageID || dm.message.message_id === messageID,
		);
		if (index === -1) {
			throw new Error(
				"Message with id " +
					messageID +
					" does not exist. DTOGenService.getDMIndex():ERROR02",
			);
		}
		return index;
	}

	async isMutualFollow(
		userID: string,
		accountFollowedId: string,
	): Promise<boolean> {
		// check if user is following accountFollowedId and accountFollowedId is following user
		// query must look like this
		// SELECT * FROM follows WHERE follower = userID AND followee = accountFollowedId
		// SELECT * FROM follows WHERE follower = accountFollowedId AND followee = userID
		const follow1: PrismaTypes.follows[] = await this.prisma.follows.findMany({
			where: {
				OR: [
					{
						follower: userID,
						followee: accountFollowedId,
					},
					{
						follower: accountFollowedId,
						followee: userID,
					},
				],
			},
		});
		console.log("Follow1: ", follow1);

		if (!follow1 || follow1 === null) {
			return false;
		}
		if (follow1.length === 0 || follow1.length === 1) {
			return false;
		}
		if (follow1.length > 2) {
			throw new Error("More than two follows found.");
		}
		return true;
	}

	async isFriendsOrPending(
		userID: string,
		accountFriendId: string,
		isPending?: boolean,
	): Promise<boolean> {
		// check if user is friends with accountFriendId
		// userId can be friend1 or friend2, so check both
		// additional condition, the is_pending field must be false

		// query must look like this
		// SELECT * FROM friends WHERE (friend1 = userID AND friend2 = accountFriendId) OR (friend1 = accountFriendId AND friend2 = userID) AND is_pending = false;
		const getWhere = (isPending?: boolean) => {
			if (isPending !== undefined) {
				return {
					OR: [
						{
							friend1: userID,
							friend2: accountFriendId,
						},
						{
							friend1: accountFriendId,
							friend2: userID,
						},
					],
					is_pending: isPending,
				};
			}

			return {
				OR: [
					{
						friend1: userID,
						friend2: accountFriendId,
					},
					{
						friend1: accountFriendId,
						friend2: userID,
					},
				],
			};
		};

		const friends: PrismaTypes.friends[] = await this.prisma.friends.findMany({
			where: getWhere(isPending),
		});
		console.log("Friends: ", friends);
		if (!friends || friends === null) {
			return false;
		}
		if (friends.length === 0) {
			return false;
		}
		if (friends.length > 1) {
			throw new Error("More than one friend found.");
		}
		return true;
	}

	async getRoomSongs(roomID: string): Promise<PrismaTypes.song[]> {
		// console.log("getting room songs:", roomID);
		const queue: (PrismaTypes.queue & { song: PrismaTypes.song })[] =
			await this.prisma.queue.findMany({
				where: { room_id: roomID },
				include: { song: true },
			});

		return queue.map((q) => q.song);
	}
	async getUserFavoriteSongs(userID: string): Promise<PrismaTypes.song[]> {
		const favorites:
			| (PrismaTypes.favorite_songs & { song: PrismaTypes.song })[] =
			await this.prisma.favorite_songs.findMany({
				where: { user_id: userID },
				include: { song: true },
			});

		return favorites.map((f) => f.song);
	}

	async getUserFriends(userID: string): Promise<PrismaTypes.users[]> {
		return await this.prisma.users.findMany({
			where: {
				OR: [
					{
						friends_friends_friend1Tousers: {
							some: {
								friend2: userID,
								is_pending: false,
							},
						},
					},
					{
						friends_friends_friend2Tousers: {
							some: {
								friend1: userID,
								is_pending: false,
							},
						},
					},
				],
			},
		});
	}

	async getMutualFriends(
		userID1: string,
		userID2: string,
	): Promise<PrismaTypes.users[]> {
		const friends1: PrismaTypes.friends[] = await this.prisma.friends.findMany({
			where: {
				OR: [
					{ friend1: userID1, is_pending: false },
					{ friend2: userID1, is_pending: false },
				],
			},
		});
		const friends2: PrismaTypes.friends[] = await this.prisma.friends.findMany({
			where: {
				OR: [
					{ friend1: userID2, is_pending: false },
					{ friend2: userID2, is_pending: false },
				],
			},
		});

		if (!friends1 || friends1 === null || !friends2 || friends2 === null) {
			throw new Error("No friends found.");
		}
		const friends1IDs: string[] = [];
		const friends2IDs: string[] = [];
		friends1.forEach((f) => {
			if (f.friend1 === userID1) {
				friends1IDs.push(f.friend2);
			} else {
				friends1IDs.push(f.friend1);
			}
		});
		friends2.forEach((f) => {
			if (f.friend1 === userID2) {
				friends2IDs.push(f.friend2);
			} else {
				friends2IDs.push(f.friend1);
			}
		});

		const mutualFriends: string[] = [];
		friends1IDs.forEach((f1) => {
			if (friends2IDs.includes(f1)) {
				mutualFriends.push(f1);
			}
		});

		const users: PrismaTypes.users[] = await this.prisma.users.findMany({
			where: { user_id: { in: mutualFriends } },
		});

		if (!users || users === null) {
			throw new Error("No mutual friends found.");
		}
		return users;
	}
}
