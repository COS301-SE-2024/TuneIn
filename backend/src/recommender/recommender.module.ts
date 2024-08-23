import { Module } from "@nestjs/common";
import { RecommenderService } from "./recommender.service";

@Module({
	providers: [RecommenderService],
})
export class RecommenderModule {}
