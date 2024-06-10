import { Module } from "@nestjs/common";
import { PrismaService } from "../../../prisma/prisma.service";
import { PrismaModule } from "prisma/prisma.module";
import { DbUtilsService } from "./db-utils.service";

@Module({
	imports: [PrismaModule],
	providers: [PrismaService, DbUtilsService],
	exports: [DbUtilsService],
})
export class DbUtilsModule {}
