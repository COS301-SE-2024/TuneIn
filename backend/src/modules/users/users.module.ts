import { Module } from "@nestjs/common";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";
import { PrismaModule } from "../../../prisma/prisma.module";
import { DtoGenModule } from "../dto-gen/dto-gen.module";
import { DbUtilsModule } from "../db-utils/db-utils.module";
import { AuthModule } from "../../auth/auth.module";
import { RecommendationsModule } from "../../recommendations/recommendations.module";

@Module({
	imports: [
		PrismaModule,
		DtoGenModule,
		DbUtilsModule,
		AuthModule,
		RecommendationsModule,
	],
	controllers: [UsersController],
	providers: [UsersService],
	exports: [UsersService],
})
export class UsersModule {}
