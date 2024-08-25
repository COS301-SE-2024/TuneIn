import { Module } from "@nestjs/common";
import { PrismaModule } from "../../../prisma/prisma.module";
import { DtoGenService } from "./dto-gen.service";
import { DbUtilsModule } from "../db-utils/db-utils.module";
import { ConfigModule } from "@nestjs/config";

@Module({
	imports: [
		PrismaModule,
		DbUtilsModule,
		ConfigModule.forRoot(), // Ensure ConfigModule is imported to access environment variables
	],
	providers: [DtoGenService],
	exports: [DtoGenService],
})
export class DtoGenModule {}
