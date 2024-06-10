import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../prisma/prisma.service";
import * as Prisma from "@prisma/client";

@Injectable()
export class DbUtilsService {
	constructor(private readonly prisma: PrismaService) {}

	//get user following
	async getUserFollowing(userID: string): Promise<Prisma.users[] | null> {
		const following: Prisma.follows[] | null =
			await this.prisma.follows.findMany({
				where: { followee: userID },
			});

		if (!following || following === null) {
			return null;
		}

		const result: Prisma.users[] = [];
		const ids: string[] = [];
		for (let i = 0; i < following.length; i++) {
			const f = following[i];
			if (f && f !== null) {
				if (f.follower && f.follower !== null) {
					ids.push(f.follower);
				}
			}
		}

		const users: Prisma.users[] = await this.prisma.users.findMany({
			where: { userID: { in: ids } },
		});

		for (let i = 0; i < users.length; i++) {
			const u = users[i];
			if (u && u !== null) {
				result.push(u);
			}
		}
		return result;
	}

	//get user followers
	async getUserFollowers(userID: string): Promise<Prisma.users[] | null> {
		const followers: Prisma.follows[] | null =
			await this.prisma.follows.findMany({
				where: { follower: userID },
			});

		if (!followers || followers === null) {
			return null;
		}

		const result: Prisma.users[] = [];
		const ids: string[] = [];
		for (let i = 0; i < followers.length; i++) {
			const f = followers[i];
			if (f && f !== null) {
				if (f.followee && f.followee !== null) {
					ids.push(f.followee);
				}
			}
		}

		const users: Prisma.users[] = await this.prisma.users.findMany({
			where: { userID: { in: ids } },
		});

		for (let i = 0; i < users.length; i++) {
			const u = users[i];
			if (u && u !== null) {
				result.push(u);
			}
		}
		return result;
	}

	async getRandomRooms(count: number): Promise<Prisma.room[] | null> {
		const rooms: Prisma.room[] | null = await this.prisma.room.findMany();

		if (!rooms || rooms === null) {
			return null;
		}

		if (rooms.length <= count) {
			return rooms;
		}

		const result: Prisma.room[] = [];
		while (result.length < count) {
			const random = Math.floor(Math.random() * rooms.length);
			if (!result.includes(rooms[random])) {
				result.push(rooms[random]);
			}
		}
		return rooms;
	}

	async isRoomPublic(roomID: string): Promise<boolean> {
		const room: Prisma.room | null = await this.prisma.room.findUnique({
			where: { roomID: roomID },
		});
		if (!room || room === null) {
			throw new Error("Room not found. Probably doesn't exist.");
		}

		const publicRoom: Prisma.public_room | null =
			await this.prisma.public_room.findUnique({
				where: { roomID: roomID },
			});

		if (!publicRoom || publicRoom === null) {
			return false;
		}

		return true;
	}

	async isRoomPrivate(roomID: string): Promise<boolean> {
		const room: Prisma.room | null = await this.prisma.room.findUnique({
			where: { roomID: roomID },
		});
		if (!room || room === null) {
			throw new Error("Room not found. Probably doesn't exist.");
		}

		const privateRoom: Prisma.private_room | null =
			await this.prisma.private_room.findUnique({
				where: { roomID: roomID },
			});

		if (!privateRoom || privateRoom === null) {
			return false;
		}

		return true;
	}

	async userExists(userID: string): Promise<boolean> {
		const user: Prisma.users | null = await this.prisma.users.findUnique({
			where: { userID: userID },
		});
		if (!user || user === null) {
			return false;
		}
		return true;
	}

	async roomExists(roomID: string): Promise<boolean> {
		const room: Prisma.room | null = await this.prisma.room.findUnique({
			where: { roomID: roomID },
		});
		if (!room || room === null) {
			return false;
		}
		return true;
	}

	async isFollowing(
		userID: string,
		accountFollowedId: string,
	): Promise<boolean> {
		const follow: Prisma.follows[] = await this.prisma.follows.findMany({
			where: {
				follower: userID,
				followee: accountFollowedId,
			},
		});
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
}
