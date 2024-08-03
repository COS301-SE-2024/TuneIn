import { Module } from "@nestjs/common";
import { DbUtilsModule } from "../modules/db-utils/db-utils.module"; // Assuming this exists
import { DtoGenModule } from "../modules/dto-gen/dto-gen.module"; // Assuming this exists
import { RoomsModule } from "../modules/rooms/rooms.module";
import { RoomUsersModule } from "./roomusers/roomuser.module";
import { LiveGateway } from "./live.gateway";
import { EventQueueService } from "./eventqueue/eventqueue.service";
import { LiveService } from "./live.service";
import { DmUsersModule } from './dmusers/dmusers.module';

@Module({
	imports: [RoomUsersModule, DmUsersModule, DbUtilsModule, DtoGenModule, RoomsModule],
	exports: [RoomUsersModule, DmUsersModule, LiveGateway],
	providers: [LiveGateway, EventQueueService, LiveService],
})
export class LiveModule {}
