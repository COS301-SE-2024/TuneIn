import { Module } from "@nestjs/common";
import { MulterModule } from "@nestjs/platform-express";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { PrismaModule } from "./../prisma/prisma.module";
import { UsersModule } from "./modules/users/users.module";
import { AuthModule } from "./auth/auth.module";
import { RoomsModule } from "./modules/rooms/rooms.module";
import { DtoGenService } from "./modules/dto-gen/dto-gen.service";
import { DtoGenModule } from "./modules/dto-gen/dto-gen.module";
import { DbUtilsService } from "./modules/db-utils/db-utils.service";
import { DbUtilsModule } from "./modules/db-utils/db-utils.module";
import { ChatGateway } from "./chat/chat.gateway";
import { ConnectedUsersService } from "./chat/connecteduser/connecteduser.service";
import { ChatModule } from "./chat/chat.module";
import { S3Service } from "./s3/s3.service";
import { S3Module } from "./s3/s3.module";
import { SpotifyService } from "./spotify/spotify.service";
import { SpotifyModule } from "./spotify/spotify.module";
import { HttpModule } from "@nestjs/axios";
import { TasksModule } from "./tasks/tasks.module";
import { BullConfigModule } from "./bull-config/bull-config.module";
import { BullBoardModule } from "./bull-board/bull-board.module";
import { memoryStorage } from "multer";
import { SearchService } from "./modules/search/search.service";
import { SearchModule } from "./modules/search/search.module";

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		PrismaModule,
		UsersModule,
		AuthModule,
		RoomsModule,
		DtoGenModule,
		DbUtilsModule,
		ChatModule,
		S3Module,
		MulterModule.register({
			dest: "./uploads",
			storage: memoryStorage(),
		}),
		SpotifyModule,
		HttpModule,
		BullBoardModule,
		TasksModule,
		BullConfigModule,
		SearchModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
