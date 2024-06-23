import { Module } from "@nestjs/common";
import { SpotifyService } from "./spotify.service";
import { ConfigService } from "@nestjs/config";
import { HttpModule } from "@nestjs/axios";
import { PrismaModule } from "./../../prisma/prisma.module";
import { DbUtilsModule } from "src/modules/db-utils/db-utils.module";

@Module({
	imports: [HttpModule, PrismaModule, DbUtilsModule],
	controllers: [],
	providers: [SpotifyService, ConfigService],
	exports: [SpotifyService],
})
export class SpotifyModule {}
