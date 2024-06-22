import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { SpotifyAuthService } from "./spotify.service";
import { ConfigService } from "@nestjs/config";

@Module({
	imports: [HttpModule],
	controllers: [],
	providers: [SpotifyAuthService, ConfigService],
})
export class SpotifyAuthModule {}
