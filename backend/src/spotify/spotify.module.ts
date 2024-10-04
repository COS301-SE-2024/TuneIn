import { Module } from "@nestjs/common";
import { SpotifyService } from "./spotify.service";
import { HttpModule } from "@nestjs/axios";
import { PrismaModule } from "./../../prisma/prisma.module";
import { MurLockModule } from "murlock";
import { ImageModule } from "../image/image.module";

@Module({
	imports: [HttpModule, PrismaModule, MurLockModule, ImageModule],
	controllers: [],
	providers: [SpotifyService],
	exports: [SpotifyService],
})
export class SpotifyModule {}
