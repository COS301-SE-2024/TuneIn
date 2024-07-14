import { Module } from "@nestjs/common";
import { RoomsController } from "./rooms.controller";
import { RoomsService } from "./rooms.service";
import { PrismaService } from "../../../prisma/prisma.service";
import { PrismaModule } from "../../../prisma/prisma.module";
import { DtoGenService } from "../dto-gen/dto-gen.service";
import { DbUtilsService } from "../db-utils/db-utils.service";
import { AuthService } from "../../auth/auth.service";
import { ConfigModule } from "@nestjs/config";
import { DtoGenModule } from "../dto-gen/dto-gen.module";
import { DbUtilsModule } from "../db-utils/db-utils.module";
import { AuthModule } from "../../auth/auth.module";

@Module({
	imports: [PrismaModule, DtoGenModule, DbUtilsModule, AuthModule],
	controllers: [RoomsController],
	providers: [RoomsService],
	exports: [RoomsService],
})
export class RoomsModule {}
