import { Module } from "@nestjs/common";
import { DmUsersService } from "./dmusers.service";
import { DtoGenModule } from "../../modules/dto-gen/dto-gen.module";
import { DbUtilsModule } from "../../modules/db-utils/db-utils.module";
import { UsersModule } from "../../modules/users/users.module";
import { AutoModerationModule } from "../automod/automod.module";

@Module({
	imports: [DtoGenModule, DbUtilsModule, UsersModule, AutoModerationModule],
	providers: [DmUsersService],
	exports: [DmUsersService],
})
export class DmUsersModule {}
