import { Module } from "@nestjs/common";
import { PrismaModule } from "../../../prisma/prisma.module";
import { DbUtilsService } from "./db-utils.service";
import { ConfigModule } from "@nestjs/config";

@Module({
	imports: [
		PrismaModule,
		ConfigModule.forRoot(), // Ensure ConfigModule is imported to access environment variables
	],
	providers: [DbUtilsService],
	exports: [DbUtilsService],
})
export class DbUtilsModule {}
