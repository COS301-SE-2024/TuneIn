import { Module } from "@nestjs/common";
import { SongsService } from "./songs.service";
import { SongsController } from "./songs.controller";
import { PrismaModule } from "prisma/prisma.module";
import { AuthModule } from "../../auth/auth.module";

@Module({
	imports: [PrismaModule, AuthModule],
	providers: [SongsService],
	controllers: [SongsController],
	exports: [SongsService],
})
export class SongsModule {}
