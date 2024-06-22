import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { SpotifyAuthService } from "./spotify.service";

@Module({
	imports: [HttpModule],
	controllers: [],
	providers: [SpotifyAuthService],
})
export class SpotifyAuthModule {}
