import { Module } from "@nestjs/common";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";
import { PrismaService } from "../../../prisma/prisma.service";
import { PrismaModule } from "prisma/prisma.module";

@Module({
	imports: [PrismaModule],
	controllers: [UsersController],
	providers: [UsersService, PrismaService],
})
export class UsersModule {}
