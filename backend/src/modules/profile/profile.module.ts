import { Module } from "@nestjs/common";
import { ProfileController } from "./profile.controller";
import { ProfileService } from "./profile.service";
import { PrismaService } from "../../../prisma/prisma.service";
import { PrismaModule } from "prisma/prisma.module";

@Module({
	controllers: [ProfileController],
	providers: [ProfileService, PrismaService],
	imports: [PrismaModule],
})
export class ProfileModule {}
