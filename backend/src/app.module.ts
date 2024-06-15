import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "./../prisma/prisma.module";
import { UsersModule } from "./modules/users/users.module";
import { AuthModule } from "./auth/auth.module";
import { RoomsModule } from "./modules/rooms/rooms.module";
import { ProfileModule } from "./modules/profile/profile.module";
import { DtoGenService } from "./modules/dto-gen/dto-gen.service";
import { DtoGenModule } from "./modules/dto-gen/dto-gen.module";
import { DbUtilsService } from "./modules/db-utils/db-utils.service";
import { DbUtilsModule } from "./modules/db-utils/db-utils.module";
import { ChatGateway } from './chat/chat.gateway';
import { ConnecteduserService } from './chat/connecteduser/connecteduser.service';

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		PrismaModule,
		UsersModule,
		AuthModule,
		RoomsModule,
		ProfileModule,
		DtoGenModule,
		DbUtilsModule,
	],
	controllers: [AppController],
	providers: [AppService, DtoGenService, DbUtilsService, ChatGateway, ConnecteduserService],
})
export class AppModule {}
