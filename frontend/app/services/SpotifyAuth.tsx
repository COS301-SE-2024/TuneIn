export type SpotifyTokenResponse = {
	access_token: string;
	token_type: string;
	scope: string;
	expires_in: number;
	refresh_token: string;
}

export type SpotifyTokenRefreshResponse = {
	access_token: string;
	token_type: string;
	scope: string;
	expires_in: number;
}

export type SpotifyTokenPair = {
	tokens: SpotifyTokenResponse;
	epoch_expiry: number;
};

export type SpotifyCallbackResponse = {
	token: string;
	spotifyTokens: SpotifyTokenResponse;
}

class SpotifyAuthManagement {
    function getTokens(): SpotifyTokenPair | null {
        /*
        //make post request to backend server get access token
			fetch(
				`${utils.API_BASE_URL}/auth/spotify/callback?code=${code}&state=${state}&redirect=${encodeURIComponent(redirectURI)}`,
				{
					method: "GET",
					headers: {
						"Content-Type": "application/json",
					},
				},
			)
				.then((res) => res.json())
				.then((data) => {
					console.log("Data:", data);
				})
				.catch((err) => {
					console.error("Error:", err);
					return;
				});
        */


    }
}
export default new SpotifyAuthManagement();
