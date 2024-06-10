import { Module } from "@nestjs/common";
import { RoomsController } from "./rooms.controller";
import { RoomsService } from "./rooms.service";
import { PrismaService } from "../../../prisma/prisma.service";
import { PrismaModule } from "prisma/prisma.module";

@Module({
	controllers: [RoomsController],
	providers: [RoomsService, PrismaService],
	imports: [PrismaModule],
})
export class RoomsModule {}
