// useSpotifyAuth.ts
import { useState, useEffect } from "react";
import axios from "axios";
import * as StorageService from "../services/StorageService";
import { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } from "@env";
const clientId = SPOTIFY_CLIENT_ID;

console.log("@env clientId: ", SPOTIFY_CLIENT_ID);
console.log("clientId: ", clientId);

if (!clientId) {
	throw new Error(
		"No Spotify client ID (SPOTIFY_CLIENT_ID) provided in environment variables",
	);
}

const clientSecret = SPOTIFY_CLIENT_SECRET;
if (!clientSecret) {
	throw new Error(
		"No Spotify client secret (SPOTIFY_CLIENT_SECRET) provided in environment variables",
	);
}

export const useSpotifyAuth = () => {
	const [accessToken, setAccessToken] = useState<string>("");
	const [refreshToken, setRefreshToken] = useState<string>("");
	const [error, setError] = useState<string | null>(null);
	const [expirationTime, setExpirationTime] = useState<number | null>();

	useEffect(() => {
		fetchData();
	});

	useEffect(() => {
		if (expirationTime) {
			const interval = setInterval(() => {
				const currentTime = Date.now();
				if (currentTime >= expirationTime - 180000) {
					// Refresh token 3 minutes before expiration
					refreshAccessToken();
				}
			}, 10000); // Check every 10 seconds
			return () => clearInterval(interval);
		}
	});

	const fetchData = async () => {
		try {
			const token = await StorageService.getItem("access_token");
			const storedRefreshToken = await StorageService.getItem("refresh_token");
			const storedExpirationTime =
				await StorageService.getItem("expiration_time");

			if (token) {
				setAccessToken(token);
				await refreshAccessTokenIfNeeded(token);
			}
			if (storedRefreshToken) {
				setRefreshToken(storedRefreshToken);
			}
			if (storedExpirationTime) {
				setExpirationTime(parseInt(storedExpirationTime, 10));
			}
		} catch (err) {
			setError("An error occurred while fetching data");
			console.error("An error occurred while fetching data", err);
		}
	};

	const handleTokenChange = async (token: string, expiresIn: number = 3600) => {
		try {
			setAccessToken(token);
			await StorageService.setItem("access_token", token);
			const expirationTime = Date.now() + expiresIn * 1000; // Current time + expiresIn (1 hour)
			setExpirationTime(expirationTime);
			await StorageService.setItem(
				"expiration_time",
				expirationTime.toString(),
			);
		} catch (err) {
			setError("An error occurred while saving token");
			console.error("An error occurred while saving token", err);
		}
	};

	const handleRefreshTokenChange = async (token: string) => {
		try {
			setRefreshToken(token);
			await StorageService.setItem("refresh_token", token);
		} catch (err) {
			setError("An error occurred while saving refresh token");
			console.error("An error occurred while saving refresh token", err);
		}
	};

	const getRefreshToken = async (): Promise<void> => {
		try {
			const storedRefreshToken = await StorageService.getItem("refresh_token");
			if (!storedRefreshToken) throw new Error("No refresh token found");
			const response = await axios.post(
				"http://192.168.118.63:4000/refresh_token",
				{
					refresh_token: storedRefreshToken,
				},
			);

			if (!response) throw new Error("Failed to refresh token");

			const data = await response.data;
			await handleTokenChange(data.access_token, data.expires_in);
		} catch (err) {
			setError("An error occurred while refreshing token");
			console.error("An error occurred while refreshing token", err);
		}
	};

	const refreshAccessTokenIfNeeded = async (token: string) => {
		const currentTime = Date.now();
		if (expirationTime && currentTime >= expirationTime - 60000) {
			// If token is about to expire in 1 minute
			await getRefreshToken();
		}
	};

	const refreshAccessToken = async () => {
		try {
			const storedRefreshToken = await StorageService.getItem("refresh_token");
			if (!storedRefreshToken) throw new Error("No refresh token found");
			const response = await axios.post(
				"http://192.168.118.63:4000/refresh_token",
				{
					refresh_token: storedRefreshToken,
				},
			);

			if (!response) throw new Error("Failed to refresh token");

			const data = await response.data;
			await handleTokenChange(data.access_token, data.expires_in);
		} catch (err) {
			setError("An error occurred while refreshing token");
			console.error("An error occurred while refreshing token", err);
		}
	};

	const getToken = async (): Promise<string> => {
		try {
			let token = await StorageService.getItem("access_token");
			const storedExpirationTime =
				await StorageService.getItem("expiration_time");

			if (!token || !storedExpirationTime) {
				throw new Error("No access token found");
			}

			const expirationTime = parseInt(storedExpirationTime, 10);
			const currentTime = Date.now();

			if (currentTime >= expirationTime) {
				console.log("Token has expired. Refreshing token...");
				await getRefreshToken();
				token = await StorageService.getItem("access_token");
				console.log("Token refreshed:", token);
			}

			return token;
		} catch (err) {
			console.error("An error occurred while getting the token", err);
			throw err;
		}
	};

	return {
		accessToken,
		refreshToken,
		error,
		handleTokenChange,
		handleRefreshTokenChange,
		getRefreshToken,
		getToken,
	};
};
