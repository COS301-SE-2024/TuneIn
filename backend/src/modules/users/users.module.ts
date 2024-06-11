import { Module } from "@nestjs/common";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";
import { PrismaService } from "../../../prisma/prisma.service";
import { PrismaModule } from "../../../prisma/prisma.module";
import { DtoGenService } from "../dto-gen/dto-gen.service";
import { DbUtilsService } from "../db-utils/db-utils.service";

@Module({
	imports: [PrismaModule],
	controllers: [UsersController],
	providers: [UsersService, PrismaService, DtoGenService, DbUtilsService],
})
export class UsersModule {}
