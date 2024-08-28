import { Controller, Get, Query } from "@nestjs/common";
import { RecommenderService } from "./recommender.service";

@Controller("recommender")
export class RecommenderController {
	constructor(private readonly recommenderService: RecommenderService) {}

	@Get("playlistTop")
	async getPlaylistRecommendations(@Query("topN") query: number) {
		const playlistArray = this.recommenderService.getTopPlaylists(query);
		return playlistArray;
	}
}
