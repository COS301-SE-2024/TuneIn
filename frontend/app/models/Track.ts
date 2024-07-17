export interface Track {
	id: string;
	name: string;
	artists: { name: string }[];
	album: { images: { url: string }[] };
	explicit: boolean;
	preview_url: string; // URL for previewing the song
	uri: string; // URI used to play the song
	duration_ms: number;
	albumArtUrl?: string;
}
