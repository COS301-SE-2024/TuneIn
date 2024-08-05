import { Module } from "@nestjs/common";
import { RoomQueueService } from "./roomqueue.service";
import { PrismaModule } from "../../../../prisma/prisma.module";
import { DtoGenModule } from "../../dto-gen/dto-gen.module";
import { DbUtilsModule } from "../../db-utils/db-utils.module";

@Module({
	imports: [PrismaModule, DtoGenModule, DbUtilsModule],
	providers: [RoomQueueService],
	exports: [RoomQueueService],
})
export class RoomQueueModule {}
