import { Module } from "@nestjs/common";
import { RoomsController } from "./rooms.controller";
import { RoomsService } from "./rooms.service";
import { PrismaService } from "../../../prisma/prisma.service";
import { PrismaModule } from "../../../prisma/prisma.module";
import { DtoGenService } from "../dto-gen/dto-gen.service";
import { DbUtilsService } from "../db-utils/db-utils.service";

@Module({
	controllers: [RoomsController],
	providers: [RoomsService, PrismaService, DtoGenService, DbUtilsService],
	imports: [PrismaModule],
})
export class RoomsModule {}
