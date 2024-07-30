import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { DbUtilsService } from 'src/modules/db-utils/db-utils.service';
import { DtoGenService } from 'src/modules/dto-gen/dto-gen.service';
import { RoomDto } from 'src/modules/rooms/dto/room.dto';

@Injectable()
export class ActivityService {
    constructor(
		private readonly prisma: PrismaService,
		private readonly dbUtils: DbUtilsService,
		private readonly dtogen: DtoGenService,
	) {}

    async getFollowingRooms(userId: string): Promise<RoomDto[]> {
        // get all the people the user follows
        const following = await this.dbUtils.getUserFollowing(userId);

        const rooms = await this.prisma.room.findMany({
            where: {
                room_creator: {
                    in: following?.map((f) => f.user_id ?? ''),
                }
            },
        });
        // filter out the private rooms
        const _publicRooms: any =  rooms.filter((room) => this.dbUtils.isRoomPublic(room.room_id));
        const publicRooms: RoomDto[] = _publicRooms.map((room: any) => this.dtogen.generateRoomDto(room.room_id));
        return publicRooms;
    }
}
