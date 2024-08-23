import { Controller, Get, Query } from "@nestjs/common";
import { RecommenderService } from "./recommender.service";

@Controller("recommender")
export class RecommenderController {
	constructor(private readonly recommenderService: RecommenderService) {}

	// @Get("top")
	// async getRecommendations(@Query("topN") query: number) {
	// 	return this.recommenderService.getTopRecommendations(query);
	// }

	// @Get("topWeighted")
	// async getRecommendationsWeighted(@Query("topN") query: number) {
	// 	return this.recommenderService.getTopRecommendationsWeighted(query);
	// }

	@Get("playlistTop")
	async getPlaylistRecommendations(@Query("topN") query: number) {
		console.log("getPlaylistRecommendations");

		const playlistArray = this.recommenderService.getTopPlaylists(query);
		// Example usage
		// analyzeFeatureDistribution(playlistArray);
		return playlistArray;
	}
}
