import { Module } from "@nestjs/common";
import { ConnectedUsersService } from "./connecteduser.service";
import { PrismaModule } from "../../../prisma/prisma.module";
import { PrismaService } from "../../../prisma/prisma.service";
import { DtoGenService } from "../../modules/dto-gen/dto-gen.service";
import { DbUtilsService } from "../../modules/db-utils/db-utils.service";

@Module({
	imports: [PrismaModule],
	providers: [
		PrismaService,
		DtoGenService,
		DbUtilsService,
		ConnectedUsersService,
	],
	exports: [ConnectedUsersService],
})
export class ConnectedUsersModule {}