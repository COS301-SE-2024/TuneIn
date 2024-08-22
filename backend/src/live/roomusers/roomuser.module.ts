import { Module } from "@nestjs/common";
import { RoomUsersService } from "./roomuser.service";
import { PrismaModule } from "../../../prisma/prisma.module";
import { DtoGenModule } from "../../modules/dto-gen/dto-gen.module";
import { DbUtilsModule } from "../../modules/db-utils/db-utils.module";

@Module({
	imports: [PrismaModule, DtoGenModule, DbUtilsModule],
	providers: [RoomUsersService],
	exports: [RoomUsersService],
})
export class RoomUsersModule {}
