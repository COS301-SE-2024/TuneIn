import axios from "axios";
import * as utils from "./Utils";
import auth from "./AuthManagement";

export type SpotifyTokenResponse = {
	access_token: string;
	token_type: string;
	scope: string;
	expires_in: number;
	refresh_token: string;
};

export type SpotifyTokenRefreshResponse = {
	access_token: string;
	token_type: string;
	scope: string;
	expires_in: number;
};

export type SpotifyTokenPair = {
	tokens: SpotifyTokenResponse;
	epoch_expiry: number;
};

export type SpotifyCallbackResponse = {
	token: string;
	spotifyTokens: SpotifyTokenResponse;
};

export async function exchangeCodeWithBackend(
	code: string,
	state: string,
	redirectURI: string,
): Promise<SpotifyCallbackResponse> {
	try {
		const response = await axios.get(
			`${utils.API_BASE_URL}/auth/spotify/callback?code=${code}&state=${state}&redirect=${encodeURIComponent(
				redirectURI,
			)}`,
			{
				headers: {
					"Content-Type": "application/json",
				},
			},
		);

		const r: SpotifyCallbackResponse = response.data;
		return r;
	} catch (error) {
		console.error("Failed to exchange code with backend:", error);
	}
	throw new Error("Something went wrong while exchanging code with backend");
}

export async function getTokens(): Promise<SpotifyTokenResponse> {
	if (auth.authenticated()) {
		try {
			const token = await auth.getToken();
			const response = await axios.get(
				`${utils.API_BASE_URL}/auth/spotify/tokens`,
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				},
			);

			const r: SpotifyTokenResponse = response.data;
			return r;
		} catch (error) {
			console.error("Failed to get tokens:", error);
		}
		throw new Error("Something went wrong while getting Spotify tokens");
	} else {
		throw new Error("Not authenticated");
	}
}
