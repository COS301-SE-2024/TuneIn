import { Module } from "@nestjs/common";
import { RecommendationsService } from "./recommendations.service";
import { PrismaModule } from "../../prisma/prisma.module";

@Module({
	imports: [PrismaModule],
	providers: [RecommendationsService],
	exports: [RecommendationsService],
})
export class RecommendationsModule {}
