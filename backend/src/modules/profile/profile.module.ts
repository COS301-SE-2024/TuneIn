import { Module } from "@nestjs/common";
import { ProfileController } from "./profile.controller";
import { ProfileService } from "./profile.service";
import { PrismaService } from "../../../prisma/prisma.service";
import { PrismaModule } from "prisma/prisma.module";
import { DtoGenService } from "../dto-gen/dto-gen.service";
import { DbUtilsService } from "../db-utils/db-utils.service";
import { DtoGenModule } from "../dto-gen/dto-gen.module";
import { DbUtilsModule } from "../db-utils/db-utils.module";

@Module({
	controllers: [ProfileController],
	providers: [ProfileService, PrismaService, DtoGenService, DbUtilsService],
	imports: [PrismaModule, DtoGenModule, DbUtilsModule],
})
export class ProfileModule {}
