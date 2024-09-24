import { Injectable } from "@nestjs/common";
@Injectable()
export class RecommendationsService {
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
	private mockSongs: {
		danceability: number;
		energy: number;
		key: number;
		loudness: number;
		mode: number;
		speechiness: number;
		acousticness: number;
		instrumentalness: number;
		liveness: number;
		valence: number;
		tempo: number;
	}[] = [];

	setPlaylists(playlists: { [key: string]: any[] }) {
		// check whether the individual songs in playlists are not null or undefined
		for (const [playlistName, songs] of Object.entries(playlists)) {
			console.log("playlistName: ", playlistName);
			if (songs.some((song) => !song)) {
				throw new Error("Invalid song in playlist");
			}
		}

		this.playlists = playlists;
	}
	setMockSongs(mockSongs: any[]) {
		this.mockSongs = mockSongs;
	}

	private cosineSimilarityWeighted(
		favoriteSongs: any,
		song2: any,
		weights: any,
	): number {
		let weightedSimilarities = 0;
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
		return weightedSimilarities / favoriteSongs.length;
	}

	getPlaylistSimilarityScores(): { [key: string]: number } {
		const playlistScores: { [key: string]: number } = {};
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

	getTopPlaylists(topN: number): { playlist: string; score: number }[] {
		const playlistScores = this.getPlaylistSimilarityScores();
		return Object.entries(playlistScores)
			.map(([playlist, score]) => ({ playlist, score }))
			.sort((a, b) => b.score - a.score)
			.slice(0, topN);
	}
}
