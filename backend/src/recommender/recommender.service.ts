import { Injectable, OnModuleInit } from "@nestjs/common";
import * as fs from "fs";
import * as path from "path";

@Injectable()
export class RecommenderService implements OnModuleInit {
	private featureWeights = {
		danceability: 1,
		energy: 1,
		key: 0.5,
		loudness: 0.5,
		mode: 0.5,
		speechiness: 0.5,
		acousticness: 0.5,
		instrumentalness: 0.5,
		liveness: 0.5,
		valence: 1,
		tempo: 0.5,
	};

	private playlists: { [key: string]: any[] } = {};
	private mockSong = {
		danceability: 0.626,
		energy: 0.67,
		key: 7,
		loudness: -6.6,
		mode: 0,
		speechiness: 0.0944,
		acousticness: 0.55,
		instrumentalness: 0,
		liveness: 0.116,
		valence: 0.497,
		tempo: 79.839,
	};

	constructor() {}

	async onModuleInit() {
		await this.loadData();
	}

	private async loadData(): Promise<void> {
		const filePath = path.join(__dirname, "..", "combined_playlists.json"); // this is path to the mock data

		try {
			const data = fs.readFileSync(filePath, "utf-8");
			const parsedData = JSON.parse(data);
			this.playlists = parsedData.playlists
				? this.flattenPlaylists(parsedData.playlists)
				: {};
			console.log("Data loaded successfully");
		} catch (error) {
			console.error("Error loading JSON file:", error);
		}
	}

	private flattenPlaylists(playlists: { [key: string]: any[] }): {
		[key: string]: any[];
	} {
		// Flatten playlists structure
		return playlists;
	}

	private cosineSimilarityWeighted(
		song1: any,
		song2: any,
		weights: any,
	): number {
		const dotProduct = Object.keys(song1).reduce((sum, key) => {
			if (key in weights) {
				return sum + song1[key] * song2[key] * weights[key];
			}
			return sum;
		}, 0);

		const magnitude1 = Math.sqrt(
			Object.keys(song1).reduce((sum, key) => {
				if (key in weights) {
					return sum + song1[key] * song1[key] * weights[key];
				}
				return sum;
			}, 0),
		);

		const magnitude2 = Math.sqrt(
			Object.keys(song2).reduce((sum, key) => {
				if (key in weights) {
					return sum + song2[key] * song2[key] * weights[key];
				}
				return sum;
			}, 0),
		);

		return dotProduct / (magnitude1 * magnitude2);
	}

	getPlaylistSimilarityScores(): { [key: string]: number } {
		const playlistScores: { [key: string]: number } = {};

		for (const [playlistName, songs] of Object.entries(this.playlists)) {
			const totalSimilarity = songs.reduce((sum, song) => {
				return (
					sum +
					this.cosineSimilarityWeighted(
						this.mockSong,
						song,
						this.featureWeights,
					)
				);
			}, 0);

			const averageSimilarity = songs.length
				? totalSimilarity / songs.length
				: 0;
			playlistScores[playlistName] = averageSimilarity;
		}

		return playlistScores;
	}

	getTopPlaylists(topN: number): { playlist: string; score: number }[] {
		const playlistScores = this.getPlaylistSimilarityScores();
		return Object.entries(playlistScores)
			.map(([playlist, score]) => ({ playlist, score }))
			.sort((a, b) => b.score - a.score)
			.slice(0, topN);
	}
}
