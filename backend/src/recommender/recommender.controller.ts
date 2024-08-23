import { Controller, Get, Query } from "@nestjs/common";
import { RecommenderService } from "./recommender.service";

@Controller("recommender")
export class RecommenderController {
	constructor(private readonly recommenderService: RecommenderService) {}
	@Get("top")
	async getRecommendations(@Query("topN") query: number) {
		return this.recommenderService.getTopRecommendations(query);
	}
	@Get("topWeighted")
	async getRecommendationsWeighted(@Query("topN") query: number) {
		return this.recommenderService.getTopRecommendationsWeighted(query);
	}
}
