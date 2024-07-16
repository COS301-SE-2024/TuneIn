import { Module } from "@nestjs/common";
import { PrismaModule } from "../../../prisma/prisma.module";
import { DbUtilsService } from "./db-utils.service";

@Module({
	imports: [PrismaModule],
	providers: [DbUtilsService],
	exports: [DbUtilsService],
})
export class DbUtilsModule {}
