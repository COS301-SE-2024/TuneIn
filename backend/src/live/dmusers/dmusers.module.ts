import { Module } from "@nestjs/common";
import { DmUsersService } from "./dmusers.service";
import { PrismaModule } from "../../../prisma/prisma.module";
import { DtoGenModule } from "../../modules/dto-gen/dto-gen.module";
import { DbUtilsModule } from "../../modules/db-utils/db-utils.module";
import { UsersModule } from "../../modules/users/users.module";

@Module({
	imports: [PrismaModule, DtoGenModule, DbUtilsModule, UsersModule],
	providers: [DmUsersService],
	exports: [DmUsersService],
})
export class DmUsersModule {}
