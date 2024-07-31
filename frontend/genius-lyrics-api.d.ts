declare module "genius-lyrics-api" {
	export interface GeniusLyricsOptions {
		apiKey: string;
		title: string;
		artist: string;
		optimizeQuery?: boolean;
	}

	export interface Song {
		id: number;
		title: string;
		url: string;
		lyrics: string;
		albumArt: string;
	}

	export interface SearchResult {
		id: number;
		url: string;
		title: string;
		albumArt: string;
	}

	export function getLyrics(
		options: GeniusLyricsOptions | string,
	): Promise<string | null>;
	export function getAlbumArt(
		options: GeniusLyricsOptions,
	): Promise<string | null>;
	export function getSong(options: GeniusLyricsOptions): Promise<Song | null>;
	export function searchSong(
		options: GeniusLyricsOptions,
	): Promise<SearchResult[] | null>;
	export function getSongById(
		id: number | string,
		access_token: string,
	): Promise<Song | null>;
}
