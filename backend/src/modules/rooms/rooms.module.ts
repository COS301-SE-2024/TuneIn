import { Module } from "@nestjs/common";
import { RoomsController } from "./rooms.controller";
import { RoomsService } from "./rooms.service";
import { PrismaService } from "../../../prisma/prisma.service";
import { PrismaModule } from "../../../prisma/prisma.module";
import { DtoGenService } from "../dto-gen/dto-gen.service";
import { DbUtilsService } from "../db-utils/db-utils.service";
import { AuthService } from "../../auth/auth.service";
import { ConfigModule } from "@nestjs/config";

@Module({
	controllers: [RoomsController],
	providers: [
		RoomsService,
		PrismaService,
		DtoGenService,
		DbUtilsService,
		AuthService,
	],
	imports: [PrismaModule, ConfigModule.forRoot({ isGlobal: true })],
	exports: [RoomsService],
})
export class RoomsModule {}
