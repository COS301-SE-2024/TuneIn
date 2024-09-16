import { Module } from "@nestjs/common";
import { ProfileController } from "./profile.controller";
import { ProfileService } from "./profile.service";
import { PrismaService } from "../../../prisma/prisma.service";
import { PrismaModule } from "../../../prisma/prisma.module";
import { AuthService } from "src/auth/auth.service";
import { DbUtilsService } from "src/modules/db-utils/db-utils.service";
import { DtoGenService } from "src/modules/dto-gen/dto-gen.service";
// import { DtoGenService } from "../dto-gen/dto-gen.service";
// import { DbUtilsService } from "../db-utils/db-utils.service";
// import { AuthService } from "../../auth/auth.service";

@Module({
	controllers: [ProfileController],
	providers: [
		ProfileService,
		PrismaService,
		DtoGenService,
		DbUtilsService,
		AuthService,
	],
	imports: [PrismaModule],
	exports: [ProfileService],
})
export class ProfileModule {}
