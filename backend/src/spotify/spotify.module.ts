import { Module } from "@nestjs/common";
import { SpotifyService } from "./spotify.service";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { HttpModule } from "@nestjs/axios";
import { PrismaModule } from "./../../prisma/prisma.module";

@Module({
	imports: [HttpModule, PrismaModule, ConfigModule.forRoot({ isGlobal: true })],
	controllers: [],
	providers: [SpotifyService, ConfigService],
	exports: [SpotifyService],
})
export class SpotifyModule {}
