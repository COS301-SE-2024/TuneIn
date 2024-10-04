import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { SpotifyAuthService } from "./spotifyauth.service";
import { PrismaModule } from "../../../prisma/prisma.module";
import { DbUtilsModule } from "../../modules/db-utils/db-utils.module";
import { TasksModule } from "../../tasks/tasks.module";
@Module({
	imports: [HttpModule, PrismaModule, DbUtilsModule, TasksModule],
	controllers: [],
	providers: [SpotifyAuthService],
	exports: [SpotifyAuthService],
})
export class SpotifyAuthModule {}
