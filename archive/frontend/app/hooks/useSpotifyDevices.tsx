import { useState, useEffect } from "react";
import { Alert } from "react-native";
import { Devices } from "../models/Devices"; // Ensure this path is correct
import { useLive } from "../LiveContext";
import { SpotifyTokenPair, SpotifyTokenResponse } from "../../api";
import { Device } from "@spotify/web-api-ts-sdk";

export const useSpotifyDevices = () => {
	const { spotifyAuth } = useLive();
	const [devices, setDevices] = useState<Devices[]>([]); // Update to use Devices type
	const [error, setError] = useState<string | null>(null);

	const fetchToken = async (): Promise<string> => {
		try {
			const tp: SpotifyTokenPair | null = await spotifyAuth.getSpotifyTokens();
			if (!tp) {
				throw new Error("No tokens found");
			}
			const tokens: SpotifyTokenResponse = tp.tokens;
			const token = tokens.access_token;
			console.log("allTokens: ", tokens, "\ntoken: ", token);
			return token;
		} catch (err) {
			setError("An error occurred while fetching the token");
			console.error("An error occurred while fetching the token", err);
			throw err;
		}
	};

	const getDevices = async (token: string) => {
		try {
			fetchToken().then(async (token) => {
				const response = await fetch(
					"https://api.spotify.com/v1/me/player/devices",
					{
						method: "GET",
						headers: {
							Authorization: `Bearer ${token}`,
							"Content-Type": "application/json",
						},
					},
				);

				if (!response.ok) {
					throw new Error(`HTTP error! Status: ${response.status}`);
				}

				const data = await response.json();
				setDevices(data.devices);
			});
		} catch (err) {
			setError("An error occurred while fetching devices");
			console.error("An error occurred while fetching devices", err);
		}
	};

	const getFirstDevice = async (): Promise<string | null> => {
		try {
			if (devices.length > 0) {
				return devices[0].id; // Return the ID of the first device
			} else {
				Alert.alert("No Devices Found", "No devices are currently active.");
				return null;
			}
		} catch (err) {
			setError("An error occurred while getting the device ID");
			console.error("An error occurred while getting the device ID", err);
			return null;
		}
	};

	return {
		devices,
		getFirstDevice,
		error,
	};
};
