import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../prisma/prisma.service";
import * as Prisma from "@prisma/client";

@Injectable()
export class DbUtilsService {
	constructor(private readonly prisma: PrismaService) {}

	//get user following
	async getUserFollowing(user_id: string): Promise<Prisma.users[] | null> {
		const following: Prisma.follows[] | null =
			await this.prisma.follows.findMany({
				where: { followee: user_id },
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
			where: { user_id: { in: ids } },
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
	async getUserFollowers(user_id: string): Promise<Prisma.users[] | null> {
		const followers: Prisma.follows[] | null =
			await this.prisma.follows.findMany({
				where: { follower: user_id },
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
			where: { user_id: { in: ids } },
		});

		for (let i = 0; i < users.length; i++) {
			const u = users[i];
			if (u && u !== null) {
				result.push(u);
			}
		}
		return result;
	}

	async getLinks(user: Prisma.users): Promise<{ count: number; data: string[] }> {
		if (!user.external_links) {
			// console.log("external links is null");
		  return { count: 0, data: [] };
		}
	  
		try {
		  // Parse the JSON string
		  const links = JSON.parse(JSON.stringify(user.external_links));
		  
		  // Ensure the parsed object has the required properties
		  if (links && typeof links === 'object' && 'count' in links && 'data' in links) {
			return {
			  count: links.count,
			  data: links.data,
			};
		  } else {
			throw new Error("Invalid links format");
		  }
		} catch (error) {
		  console.error("Failed to parse external_links:", error);
		  return { count: 0, data: [] };
		}
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
}
