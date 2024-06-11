import { Module } from "@nestjs/common";
import { ProfileController } from "./profile.controller";
import { ProfileService } from "./profile.service";
import { PrismaService } from "../../../prisma/prisma.service";
import { PrismaModule } from "../../../prisma/prisma.module";
import { DtoGenService } from "../dto-gen/dto-gen.service";
import { DbUtilsService } from "../db-utils/db-utils.service";

@Module({
	controllers: [ProfileController],
	providers: [ProfileService, PrismaService, DtoGenService, DbUtilsService],
	imports: [PrismaModule],
})
export class ProfileModule {}
