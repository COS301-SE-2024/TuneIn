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
	private mockSongs = [
		{
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
		},
	];

	// constructor() {}
	// constructor that takes in playlists and favoriteSongs
	constructor() {}
	setPlaylists(playlists: { [key: string]: any[] }) {
		this.playlists = playlists;
	}
	setMockSongs(mockSongs: any[]) {
		this.mockSongs = mockSongs;
	}
	async onModuleInit() {
		await this.loadData();
	}

	private async loadData(): Promise<void> {
		const filePath = path.join(__dirname, "..", "combined_playlists.json"); // this is path to the mock data JSON

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
		// JSON is already flattened. No need to do anything
		return playlists;
	}

	private cosineSimilarityWeighted(
		favoriteSongs: any,
		song2: any,
		weights: any,
	): number {
		let weightedSimilarities: number = 0;
		for (const song1 of favoriteSongs) {
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

			weightedSimilarities += dotProduct / (magnitude1 * magnitude2);
		}
		// const dotProduct = Object.keys(song1).reduce((sum, key) => {
		// 	if (key in weights) {
		// 		return sum + song1[key] * song2[key] * weights[key];
		// 	}
		// 	return sum;
		// }, 0);

		// const magnitude1 = Math.sqrt(
		// 	Object.keys(song1).reduce((sum, key) => {
		// 		if (key in weights) {
		// 			return sum + song1[key] * song1[key] * weights[key];
		// 		}
		// 		return sum;
		// 	}, 0),
		// );

		// const magnitude2 = Math.sqrt(
		// 	Object.keys(song2).reduce((sum, key) => {
		// 		if (key in weights) {
		// 			return sum + song2[key] * song2[key] * weights[key];
		// 		}
		// 		return sum;
		// 	}, 0),
		// );

		return weightedSimilarities / favoriteSongs.length;
	}

	getPlaylistSimilarityScores(): { [key: string]: number } {
		const playlistScores: { [key: string]: number } = {};
		console.log("Playlist: ", this.playlists);
		for (const [playlistName, songs] of Object.entries(this.playlists)) {
			const totalSimilarity = songs.reduce((sum, song) => {
				return (
					sum +
					this.cosineSimilarityWeighted(
						this.mockSongs,
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
	analyzeFeatureDistribution = (playlists: any[]) => {
		// console.log("Analyzing feature distribution");
		// console.log(playlists);
		const features = ["danceability", "energy", "loudness", "tempo", "valence"];
		features.forEach((feature) => {
			// console.log(
			// 	"Playlist map: ",
			// 	playlists.map((p) => p[feature]),
			// 	"with feature: ",
			// 	feature,
			// );
			const values = playlists.map((p) => {
				// console.log("p: ", p[0][feature]);
				return p[0][feature];
			});
			const min = Math.min(...values);
			const max = Math.max(...values);
			console.log(`${feature}: min=${min}, max=${max}`);
		});
	};

	getTopPlaylists(topN: number): { playlist: string; score: number }[] {
		// eslint-disable-next-line prettier/prettier
        this.analyzeFeatureDistribution(Object.values(this.playlists));
		const playlistScores = this.getPlaylistSimilarityScores();
		return Object.entries(playlistScores)
			.map(([playlist, score]) => ({ playlist, score }))
			.sort((a, b) => b.score - a.score)
			.slice(0, topN);
	}
}
