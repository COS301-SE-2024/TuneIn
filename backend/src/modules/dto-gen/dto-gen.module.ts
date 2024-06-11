import { Module } from "@nestjs/common";
import { PrismaService } from "../../../prisma/prisma.service";
import { PrismaModule } from "../../../prisma/prisma.module";
import { DtoGenService } from "./dto-gen.service";
import { DbUtilsService } from "../db-utils/db-utils.service";

@Module({
	imports: [PrismaModule],
	providers: [PrismaService, DtoGenService, DbUtilsService],
	exports: [DtoGenService],
})
export class DtoGenModule {}
