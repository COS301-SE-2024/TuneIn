import { Module } from "@nestjs/common";
import { RecommenderService } from "./recommender.service";
import { RecommenderController } from "./recommender.controller";

@Module({
	providers: [RecommenderService],
	controllers: [RecommenderController],
})
export class RecommenderModule {}
