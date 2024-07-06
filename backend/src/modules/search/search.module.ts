import { Module } from "@nestjs/common";
import { SearchController } from "./search.controller";
import { SearchService } from "./search.service";
import { PrismaModule } from "../../../prisma/prisma.module";
import { PrismaService } from "../../../prisma/prisma.service";
import { AuthService } from "../../auth/auth.service";
import { DtoGenService } from "../dto-gen/dto-gen.service";
import { DbUtilsService } from "../db-utils/db-utils.service";
import { ConfigModule, ConfigService } from "@nestjs/config";

@Module({
	imports: [PrismaModule, ConfigModule.forRoot({ isGlobal: true })],
	controllers: [SearchController],
	providers: [
		SearchService,
		PrismaService,
		ConfigService,
		AuthService,
		DtoGenService,
		DbUtilsService,
	],
	exports: [SearchService],
})
export class SearchModule {}
