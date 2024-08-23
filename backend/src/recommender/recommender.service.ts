import { Injectable } from "@nestjs/common";

@Injectable()
export class RecommenderService {
	audio_features = [
		// this is merely just a very small subset of the actual data
		// actual requests to the Spotify API would be made to get the actual data
		{
			valence: 0.65,
			year: 2022,
			acousticness: 0.075,
			danceability: 0.72,
			duration_ms: 203456,
			energy: 0.68,
			explicit: false,
			instrumentalness: 0.002,
			key: 4,
			liveness: 0.12,
			loudness: -7.54,
			mode: 1,
			popularity: 82,
			speechiness: 0.05,
			tempo: 120.5,
		},
		{
			valence: 0.78,
			year: 2021,
			acousticness: 0.12,
			danceability: 0.65,
			duration_ms: 189123,
			energy: 0.75,
			explicit: true,
			instrumentalness: 0.001,
			key: 7,
			liveness: 0.09,
			loudness: -6.89,
			mode: 0,
			popularity: 90,
			speechiness: 0.04,
			tempo: 133.2,
		},
		{
			valence: 0.55,
			year: 2023,
			acousticness: 0.093,
			danceability: 0.67,
			duration_ms: 215678,
			energy: 0.72,
			explicit: false,
			instrumentalness: 0.005,
			key: 2,
			liveness: 0.15,
			loudness: -8.12,
			mode: 1,
			popularity: 76,
			speechiness: 0.06,
			tempo: 104.8,
		},
		{
			valence: 0.6,
			year: 2022,
			acousticness: 0.08,
			danceability: 0.74,
			duration_ms: 201234,
			energy: 0.66,
			explicit: true,
			instrumentalness: 0.0,
			key: 5,
			liveness: 0.11,
			loudness: -7.3,
			mode: 0,
			popularity: 85,
			speechiness: 0.07,
			tempo: 117.6,
		},
		{
			valence: 0.72,
			year: 2020,
			acousticness: 0.065,
			danceability: 0.69,
			duration_ms: 198456,
			energy: 0.7,
			explicit: false,
			instrumentalness: 0.0,
			key: 1,
			liveness: 0.13,
			loudness: -7.2,
			mode: 1,
			popularity: 88,
			speechiness: 0.03,
			tempo: 128.0,
		},
	];

	mockSong = {
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
	private cosineSimilarity(song1: any, song2: any): number {
		const dotProduct = Object.keys(song1).reduce((sum, key) => {
			if (
				key !== "year" &&
				key !== "duration_ms" &&
				key !== "explicit" &&
				key !== "popularity"
			) {
				return sum + song1[key] * song2[key];
			}
			return sum;
		}, 0);
		const magnitude1 = Math.sqrt(
			Object.keys(song1).reduce((sum, key) => {
				if (
					key !== "year" &&
					key !== "duration_ms" &&
					key !== "explicit" &&
					key !== "popularity"
				) {
					return sum + song1[key] * song1[key];
				}
				return sum;
			}, 0),
		);
		const magnitude2 = Math.sqrt(
			Object.keys(song2).reduce((sum, key) => {
				if (
					key !== "year" &&
					key !== "duration_ms" &&
					key !== "explicit" &&
					key !== "popularity"
				) {
					return sum + song2[key] * song2[key];
				}
				return sum;
			}, 0),
		);

		return dotProduct / (magnitude1 * magnitude2);
	}
}
