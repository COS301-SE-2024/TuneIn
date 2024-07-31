import { useState, useEffect } from "react";
import { getLyrics } from "../services/geniusLyricsApi";

interface UseGeniusLyricsOptions {
	apiKey: string;
	title: string;
	artist: string;
	optimizeQuery?: boolean;
}

const useGeniusLyrics = ({
	apiKey,
	title,
	artist,
	optimizeQuery = true,
}: UseGeniusLyricsOptions) => {
	const [lyrics, setLyrics] = useState<string | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchLyrics = async () => {
			try {
				const result = await getLyrics({
					apiKey,
					title,
					artist,
					optimizeQuery,
				});
				if (result) {
					setLyrics(result);
				} else {
					throw new Error("No lyrics found");
				}
			} catch (err) {
				console.error("Error fetching lyrics:", err);
				setError("Failed to fetch lyrics");
			} finally {
				setLoading(false);
			}
		};

		fetchLyrics();
	}, [apiKey, title, artist, optimizeQuery]);

	return { lyrics, loading, error };
};

export default useGeniusLyrics;
