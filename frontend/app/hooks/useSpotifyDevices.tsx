import { useState, useEffect } from "react";
import { Alert } from "react-native";
import * as spotifyAuth from "../services/SpotifyAuth";
import { Devices } from "../models/Devices"; // Ensure this path is correct

export const useSpotifyDevices = () => {
	const [accessToken, setAccessToken] = useState<string>("");
	const [devices, setDevices] = useState<Devices[]>([]); // Update to use Devices type
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchToken = async () => {
			try {
				const allTokens = await spotifyAuth.getTokens();
				const token = allTokens.access_token;
				setAccessToken(token);
			} catch (err) {
				setError("An error occurred while fetching the token");
				console.error("An error occurred while fetching the token", err);
			}
		};

		fetchToken();
	}, []);

	useEffect(() => {
		if (accessToken) {
			getDevices(accessToken);
		}
	}, [accessToken]);

	const getDevices = async (token: string) => {
		try {
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

	// Updated getDeviceIDs function to return an array of Devices
	const getDeviceIDs = async (): Promise<Devices[] | null> => {
		try {
			const response = await fetch(
				"https://api.spotify.com/v1/me/player/devices",
				{
					method: "GET",
					headers: {
						Authorization: `Bearer ${accessToken}`,
						"Content-Type": "application/json",
					},
				},
			);

			if (!response.ok) {
				console.error(`Error fetching devices: ${response.statusText}`);
				return null; // Return null if response is not ok
			}

			const data = await response.json();

			// Return the devices array or null if it's undefined
			return Array.isArray(data.devices) ? data.devices : null;
		} catch (err) {
			setError("An error occurred while fetching devices");
			console.error("An error occurred while fetching devices", err);
			return null;
		}
	};

	return {
		devices,
		getFirstDevice,
		getDeviceIDs,
		error,
	};
};
