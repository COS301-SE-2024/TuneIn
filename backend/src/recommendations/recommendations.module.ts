import { Module } from "@nestjs/common";
import { RecommendationsService } from "./recommendations.service";

@Module({
	imports: [],
	providers: [RecommendationsService],
	exports: [RecommendationsService],
})
export class RecommendationsModule {}
