import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../prisma/prisma.service";
import * as Prisma from "@prisma/client";
import { SongInfoDto } from "../rooms/dto/songinfo.dto";
import { RoomDto } from "../rooms/dto/room.dto";

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

  async getLinks(
    user: Prisma.users,
  ): Promise<{ count: number; data: string[] }> {
    const links = user.external_links;
    if (!links) {
      return { count: 0, data: [] };
    }

    try {
      // Parse the JSON string
      let count: number;

      // Ensure the parsed object has the required properties
      if (
        links &&
        Array.isArray(links) &&
        links.every(link => typeof link === "string")
    ) {

        if (links && Array.isArray(links)) {
          count = links.length;
        } else {
          count = 0;
        }

        return {
          count: count,
          data: Array.isArray(links)? links.map(String) : [],
        };
      } else {
        throw new Error("Invalid links format");
      }
    } catch (error) {
      console.error("Failed to parse external_links: ", error);
      return { count: 0, data: [] };
    }
  }

  async getPreferences(user: Prisma.users): Promise<{
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

  async getActivity(
    user: Prisma.users,
  ): Promise<{ count: number; data: string[] }> {
    if (!user.activity) {
      return {
        count: 0,
        data: [],
      };
    }

    try {
      console.log(JSON.stringify(user.activity));
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
