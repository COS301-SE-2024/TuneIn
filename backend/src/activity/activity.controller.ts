import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { DbUtilsService } from 'src/modules/db-utils/db-utils.service';
import { DtoGenService } from 'src/modules/dto-gen/dto-gen.service';
import { ActivityService } from './activity.service';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { AuthService, JWTPayload } from 'src/auth/auth.service';
import { RoomDto } from 'src/modules/rooms/dto/room.dto';

@Controller('activity')
@ApiTags('activity')
export class ActivityController {
    constructor(
		private readonly activityService: ActivityService,
		private readonly dbUtils: DbUtilsService,
		private readonly dtogen: DtoGenService,
		private readonly auth: AuthService,
	) {}

    // create endpoint that will return rooms public rooms from the people the user follows
    @UseGuards(JwtAuthGuard)
    @Get('following')
    @ApiTags('activity')
    @ApiOperation({ summary: 'Get all public rooms from the people the user follows' })
    @ApiOkResponse({ description: 'Returns all public rooms from the people the user follows' })
    getFollowingRooms(@Request() req: any): Promise<RoomDto[]> {
        const userInfo: JWTPayload = this.auth.getUserInfo(req);
        return this.activityService.getFollowingRooms(userInfo.id);
    }

}
