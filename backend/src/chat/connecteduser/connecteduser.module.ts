import { Module } from "@nestjs/common";
import { ConnectedUsersService } from "./connecteduser.service";
import { PrismaModule } from "../../../prisma/prisma.module";
import { PrismaService } from "../../../prisma/prisma.service";
import { DtoGenService } from "../../modules/dto-gen/dto-gen.service";
import { DbUtilsService } from "../../modules/db-utils/db-utils.service";
import { DtoGenModule } from "../../modules/dto-gen/dto-gen.module";
import { DbUtilsModule } from "../../modules/db-utils/db-utils.module";

@Module({
	imports: [PrismaModule, DtoGenModule, DbUtilsModule],
	providers: [ConnectedUsersService],
	exports: [ConnectedUsersService],
})
export class ConnectedUsersModule {}
