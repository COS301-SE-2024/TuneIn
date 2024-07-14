import { Module } from "@nestjs/common";
import { PrismaService } from "../../../prisma/prisma.service";
import { PrismaModule } from "../../../prisma/prisma.module";
import { DtoGenService } from "./dto-gen.service";
import { DbUtilsService } from "../db-utils/db-utils.service";
import { DbUtilsModule } from "../db-utils/db-utils.module";

@Module({
	imports: [PrismaModule, DbUtilsModule],
	providers: [DtoGenService],
	exports: [DtoGenService],
})
export class DtoGenModule {}
