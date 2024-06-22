import { Module } from "@nestjs/common";
import { SpotifyService } from "./spotify.service";
import { ConfigService } from "@nestjs/config";
import { HttpModule } from "@nestjs/axios";

@Module({
	imports: [HttpModule],
	controllers: [],
	providers: [SpotifyService, ConfigService],
})
export class SpotifyModule {}
