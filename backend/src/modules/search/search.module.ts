import { Module } from "@nestjs/common";
import { SearchController } from "./search.controller";
import { SearchService } from "./search.service";
import { PrismaModule } from "../../../prisma/prisma.module";
import { AuthModule } from "../../auth/auth.module";
import { DtoGenModule } from "../dto-gen/dto-gen.module";
import { DbUtilsModule } from "../db-utils/db-utils.module";

@Module({
	imports: [PrismaModule, AuthModule, DtoGenModule, DbUtilsModule],
	controllers: [SearchController],
	providers: [SearchService],
	exports: [SearchService],
})
export class SearchModule {}
