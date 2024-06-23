import { Module } from "@nestjs/common";
import { MulterModule } from "@nestjs/platform-express";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { PrismaModule } from "./../prisma/prisma.module";
import { UsersModule } from "./modules/users/users.module";
import { AuthModule } from "./auth/auth.module";
import { RoomsModule } from "./modules/rooms/rooms.module";
import { ProfileModule } from "./modules/profile/profile.module";
import { DtoGenService } from "./modules/dto-gen/dto-gen.service";
import { DtoGenModule } from "./modules/dto-gen/dto-gen.module";
import { DbUtilsService } from "./modules/db-utils/db-utils.service";
import { DbUtilsModule } from "./modules/db-utils/db-utils.module";
import { S3Service } from "./s3/s3.service";
import { S3Module } from "./s3/s3.module";
import { memoryStorage } from "multer";

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
        S3Module,
        MulterModule.register({
            dest: './uploads',
			storage: memoryStorage(),
        }),
    ],
    controllers: [AppController],
    providers: [AppService, DtoGenService, DbUtilsService, S3Service],
})
export class AppModule {}
