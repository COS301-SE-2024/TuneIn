import { Alert } from "react-native";
import * as spotifyAuth from "../services/SpotifyAuth";
import { SpotifyApi, Devices, Device } from "@spotify/web-api-ts-sdk";
import { SPOTIFY_CLIENT_ID } from "react-native-dotenv";

const clientId = SPOTIFY_CLIENT_ID;
if (!clientId) {
	throw new Error(
		"No Spotify client ID (SPOTIFY_CLIENT_ID) provided in environment variables",
	);
}

class SimpleSpotifyPlayback {
	private static instance: SimpleSpotifyPlayback;
	private accessToken: string = "";
	private tokens: spotifyAuth.SpotifyTokenResponse | null = null;
	private selectedTrackUri: string = "";
	private spotifyDevices: Devices = { devices: [] };

	constructor() {
		this.fetchToken();
	}

	public static getInstance(): SimpleSpotifyPlayback {
		if (!SimpleSpotifyPlayback.instance) {
			SimpleSpotifyPlayback.instance = new SimpleSpotifyPlayback();
		}
		return SimpleSpotifyPlayback.instance;
	}

	private async fetchToken() {
		try {
			if (!this.accessToken || this.accessToken === "") {
				this.tokens = await spotifyAuth.getTokens();
				const token = this.tokens.access_token;
				console.log("Access Token:", token);
				this.accessToken = token;

				const api: SpotifyApi = SpotifyApi.withAccessToken(
					clientId,
					this.tokens,
				);
				const me = await api.currentUser.profile();
				console.log("me:", me);
			}
		} catch (err) {
			console.error("An error occurred while fetching the token", err);
		}
	}

	public async handlePlayback(
		action: string,
		uri: string | null = null,
		offset: number | null = null,
	) {
		try {
			await this.fetchToken();
			console.log("accessToken:", this.accessToken);
			if (!this.accessToken) {
				throw new Error("Access token not found");
			}
			const activeDevice = await this.getFirstDevice();
			if (!activeDevice) {
				Alert.alert("Please connect a device to Spotify");
				return;
			}
			console.log("active device:", activeDevice);

			console.log("(action, uri, offset):", action, uri, offset);

			if (uri) {
				if (uri.startsWith("spotify:album:")) {
					throw new Error("Album URIs are not supported");
				}

				if (uri.startsWith("spotify:artist:")) {
					throw new Error("Artist URIs are not supported");
				}

				if (!uri.startsWith("spotify:track:")) {
					uri = `spotify:track:${uri}`;
				}

				//validate with regex
				const uriRegex = /spotify:track:[a-zA-Z0-9]{22}/;
				if (!uriRegex.test(uri)) {
					throw new Error("Invalid URI");
				}
			}

			let url = "";
			let method = "";
			let body: any = null;

			switch (action) {
				case "play":
					if (uri) {
						body = {
							uris: [uri],
							position_ms: offset || 0,
						};
					}
					url = `https://api.spotify.com/v1/me/player/play?device_id=${activeDevice}`;
					method = "PUT";
					break;
				case "pause":
					url = `https://api.spotify.com/v1/me/player/pause?device_id=${activeDevice}`;
					method = "PUT";
					break;
				case "next":
					url = `https://api.spotify.com/v1/me/player/next?device_id=${activeDevice}`;
					method = "POST";
					break;
				case "previous":
					url = `https://api.spotify.com/v1/me/player/previous?device_id=${activeDevice}`;
					method = "POST";
					break;
				default:
					throw new Error("Unknown action");
			}

			console.log("Request URL:", url);
			console.log("Request Method:", method);
			if (body) {
				console.log("Request Body:", JSON.stringify(body, null, 2));
			}

			const response = await fetch(url, {
				method,
				headers: {
					Authorization: `Bearer ${this.accessToken}`,
					"Content-Type": "application/json",
				},
				body: body ? JSON.stringify(body) : undefined,
			});

			if (!response.ok) {
				throw new Error(`HTTP error! Status: ${response.status}`);
			}

			if (action === "play") {
				this.selectedTrackUri = uri || "";
			} else if (action === "pause") {
				this.selectedTrackUri = "";
			}
		} catch (err) {
			console.error("An error occurred while controlling playback", err);
		}
	}

	public getSelectedTrackUri() {
		return this.selectedTrackUri;
	}

	async getFirstDevice(): Promise<string | null> {
		try {
			if (
				!this.spotifyDevices.devices ||
				this.spotifyDevices.devices.length === 0
			) {
				this.spotifyDevices = { devices: await this.getDeviceIDs() };
			}

			if (this.spotifyDevices.devices.length > 0) {
				return this.spotifyDevices.devices[0].id;
			} else {
				Alert.alert("No Devices Found", "No devices are currently active.");
				return null;
			}
		} catch (err) {
			console.error("An error occurred while getting the device ID", err);
			return null;
		}
	}

	async getDeviceIDs(): Promise<Device[]> {
		try {
			if (!this.tokens) {
				throw new Error("No tokens found");
			}
			const api = SpotifyApi.withAccessToken(clientId, this.tokens);
			const data: Devices = await api.player.getAvailableDevices();
			return data.devices;
		} catch (err) {
			console.error("An error occurred while fetching devices", err);
			throw err;
		}
	}
}

export const playback = SimpleSpotifyPlayback.getInstance();
