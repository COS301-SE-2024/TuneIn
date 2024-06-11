import { Injectable } from "@nestjs/common";
import { UserProfileDto } from "../profile/dto/userprofile.dto";
import { RoomDto } from "../rooms/dto/room.dto";
import { UserDto } from "../users/dto/user.dto";
import { PrismaService } from "../../../prisma/prisma.service";
import * as Prisma from "@prisma/client";
import { DbUtilsService } from "../db-utils/db-utils.service";

/*
## UserProfileDto (User Profile Info)
A object representing User Profile information.
```json
{
	profile_name : string,
	user_id : string,
	username : string,
	profile_picture_url : string,
	followers: {
		count: int,
		data: [ProfileDto]
	},
	following: {
		count: int,
		data: [ProfileDto]
	},
	links: {
		count: int,
		data: [string]
	},
	bio : string,
	current_song: SongInfoDto,
	fav_genres: {
		count: int,
		data: [string]
	},
	fav_songs: {
		count: int,
		data: [SongInfoDto]
	},
	fav_rooms: {
		count: int,
		data: [RoomDto]
	},
	recent_rooms: {
		count: int,
		data: [RoomDto]
	}
}
```

## RoomDto (Room Info)
A object representing Room information.
```json
{
	creator: ProfileDto,
	room_id: string,
	partipicant_count: number,
	room_name: string,
	description: string,
	is_temporary: boolean,
	is_private: boolean,
	is_scheduled: boolean,
	start_date: DateTime,
	end_date: DateTime,
	language: string,
	has_explicit_content: boolean,
	has_nsfw_content: boolean,
	room_image: string,
	current_song: SongInfoDto,
	tags: [string]
}
```

## SongInfoDto (Song Info)
A object representing Song information.
```json
{
	title: string,
	artists: [string],
	cover: string,
	start_time: DateTime
}
```
*/
// A service that will generate DTOs
@Injectable()
export class DtoGenService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly dbUtils: DbUtilsService,
  ) {}

  async generateUserProfileDto(
    user_id: string,
    fully_qualify: boolean = true,
  ): Promise<UserProfileDto | null> {
    //check if user_id exists
    const user: Prisma.users | null = await this.prisma.users.findUnique({
      where: { user_id: user_id },
    });

    if (!user || user === null) {
      return null;
    }

    //get user info
    const result: UserProfileDto = this.generateBriefUserProfileDto(user);
    result.links = await this.dbUtils.getLinks(user);
    const preferences = await this.dbUtils.getPreferences(user);
    result.fav_genres = preferences.fav_genres;
    result.fav_songs = preferences.fav_songs;
    const recent_rooms = await this.dbUtils.getActivity(user);
    result.recent_rooms = {
      count: recent_rooms.count,
      data: (await this.generateMultipleRoomDto(recent_rooms.data)) || [],
    };

    const following: Prisma.users[] | null =
      await this.dbUtils.getUserFollowing(user_id);
    if (following && following !== null) {
      result.following.count = following.length;
      if (fully_qualify) {
        for (let i = 0; i < following.length; i++) {
          const f = following[i];
          if (f && f !== null) {
            const u: UserProfileDto = this.generateBriefUserProfileDto(f);
            result.following.data.push(u);
          }
        }
      }
    }

    const followers: Prisma.users[] | null =
      await this.dbUtils.getUserFollowers(user_id);
    if (followers && followers !== null) {
      result.followers.count = followers.length;
      if (fully_qualify) {
        for (let i = 0; i < followers.length; i++) {
          const f = followers[i];
          if (f && f !== null) {
            const u: UserProfileDto = this.generateBriefUserProfileDto(f);
            result.followers.data.push(u);
          }
        }
      }
    }

    //exclude current songs
    //exclude fav genres
    //exclude fav songs

    // if (fully_qualify) {
    // 	const favRooms: Prisma.room[] | null =
    // 		await this.dbUtils.getRandomRooms(5);
    // 	if (favRooms && favRooms !== null) {
    // 		result.fav_rooms.count = favRooms.length;
    // 		const ids: string[] = favRooms.map((r) => r.room_id);
    // 		const rooms = await this.generateMultipleRoomDto(ids);
    // 		if (rooms && rooms !== null) {
    // 			result.fav_rooms.data = rooms;
    // 		}
    // 	}
    // }

    // if (fully_qualify) {
    // 	const recentRooms: Prisma.room[] | null =
    // 		await this.dbUtils.getRandomRooms(5);
    // 	if (recentRooms && recentRooms !== null) {
    // 		result.recent_rooms.count = recentRooms.length;
    // 		const ids: string[] = recentRooms.map((r) => r.room_id);
    // 		const rooms = await this.generateMultipleRoomDto(ids);
    // 		if (rooms && rooms !== null) {
    // 			result.recent_rooms.data = rooms;
    // 		}
    // 	}
    // }

    return result;
  }

  generateBriefUserProfileDto(user: Prisma.users): UserProfileDto {
    const result: UserProfileDto = {
      profile_name: user.full_name || "",
      user_id: user.user_id,
      username: user.username,
      profile_picture_url: user.profile_picture || "",
      followers: {
        count: 0,
        data: [],
      },
      following: {
        count: 0,
        data: [],
      },
      links: {
        count: 0,
        data: [],
      },
      bio: user.bio || "",
      current_song: {
        title: "",
        artists: [],
        cover: "",
        start_time: new Date(),
      },
      fav_genres: {
        count: 0,
        data: [],
      },
      fav_songs: {
        count: 0,
        data: [],
      },
      fav_rooms: {
        count: 0,
        data: [],
      },
      recent_rooms: {
        count: 0,
        data: [],
      },
    };
    return result;
  }

  async generateRoomDto(room_id: string): Promise<RoomDto | null> {
    const room: Prisma.room | null = await this.prisma.room.findUnique({
      where: { room_id: room_id },
    });

    if (!room || room === null) {
      return null;
    }

    const result: RoomDto = {
      creator: new UserProfileDto(),
      room_id: room.room_id,
      participant_count: 0,
      room_name: room.name,
      description: room.description || "",
      is_temporary: room.is_temporary || false,
      is_private: false, //db must add column
      is_scheduled: false, //db must add column
      start_date: new Date(),
      end_date: new Date(),
      language: room.room_language || "",
      has_explicit_content: room.explicit || false,
      has_nsfw_content: room.nsfw || false,
      room_image: room.playlist_photo || "",
      current_song: {
        title: "",
        artists: [],
        cover: "",
        start_time: new Date(),
      },
      tags: room.tags || [],
    };

    const creator = await this.generateUserProfileDto(room.room_creator, false);
    if (creator && creator !== null) {
      result.creator = creator;
    }

    //participant count will be added later
    //current song will be added later
    //dates will be added later
    //current songs will be added later

    return result;
  }

  async generateMultipleRoomDto(room_ids: string[]): Promise<RoomDto[] | null> {
    const rooms: Prisma.room[] | null = await this.prisma.room.findMany({
      where: { room_id: { in: room_ids } },
    });

    if (!rooms || rooms === null) {
      return null;
    }

    const userIds: string[] = rooms.map((r) => r.room_creator);
    //remove duplicate user ids
    const uniqueUserIds: string[] = [...new Set(userIds)];
    const users: Prisma.users[] | null = await this.prisma.users.findMany({
      where: { user_id: { in: uniqueUserIds } },
    });

    const userProfiles: UserProfileDto[] = [];
    for (let i = 0; i < users.length; i++) {
      const u = users[i];
      if (u && u !== null) {
        const user = this.generateBriefUserProfileDto(u);
        userProfiles.push(user);
      }
    }

    const result: RoomDto[] = [];
    for (let i = 0; i < rooms.length; i++) {
      const r = rooms[i];
      if (r && r !== null) {
        const u = userProfiles.find((u) => u.user_id === r.room_creator);
        const room: RoomDto = {
          creator: u || new UserProfileDto(),
          room_id: r.room_id,
          participant_count: 0, //to fix soon
          room_name: r.name,
          description: r.description || "",
          is_temporary: r.is_temporary || false,
          is_private: false, //db must add column
          is_scheduled: false, //db must add column
          start_date: new Date(),
          end_date: new Date(),
          language: r.room_language || "",
          has_explicit_content: r.explicit || false,
          has_nsfw_content: r.nsfw || false,
          room_image: r.playlist_photo || "",
          current_song: {
            title: "",
            artists: [],
            cover: "",
            start_time: new Date(),
          },
          tags: r.tags || [],
        };
        result.push(room);
      }
    }
    return result;
  }

  async generateUserDto(): Promise<UserDto | null> {
    return new UserDto();
  }
}
