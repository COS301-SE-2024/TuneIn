import React, { useState, useEffect, useRef } from "react";
import {
	View,
	Text,
	StyleSheet,
	Modal,
	TouchableOpacity,
	Alert,
	ActivityIndicator,
} from "react-native";
import { useSpotifyDevices } from "../hooks/useSpotifyDevices";
import { RadioButton } from "react-native-paper";
import Icon from "react-native-vector-icons/FontAwesome"; // Example: using FontAwesome icons
import { Devices } from "../models/Devices";
import SpeakerIcon from "./Spotify/SpeakerIcon"; // Import SVG components
import * as spotifyAuth from "../services/SpotifyAuth";
import { colors } from "../styles/colors";

const DevicePicker = () => {
	const { getDeviceIDs, devices: initialDevices, error } = useSpotifyDevices();
	const [isVisible, setIsVisible] = useState(false);
	const [devices, setDevices] = useState<Devices[]>(initialDevices);
	const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [accessToken, setAccessToken] = useState<string>("");
	const intervalIdRef = useRef<NodeJS.Timeout | null>(null);
	useEffect(() => {
		const fetchToken = async () => {
			try {
				const allTokens = await spotifyAuth.getTokens();
				const token = allTokens.access_token;
				setAccessToken(token);
			} catch (err) {
				console.error("An error occurred while fetching the token", err);
			}
		};

		fetchToken();
	}, []);

	useEffect(() => {
		// Declare intervalId using useRef to ensure it maintains its value across renders

		if (isVisible) {
			const fetchDevices = async () => {
				try {
					const deviceList = await getDeviceIDs();
					if (deviceList) {
						setDevices(deviceList);
						const activeDevice = deviceList.find((device) => device.is_active);
						if (activeDevice) {
							setSelectedDevice(activeDevice.id);
						}
					} else {
						console.warn("Received null or undefined deviceList");
					}
				} catch (err) {
					console.error("An error occurred while fetching devices", err);
				}
			};

			// Initial fetchDevices call
			fetchDevices();

			// Set interval to call fetchDevices every 4 seconds
			intervalIdRef.current = setInterval(fetchDevices, 4000);

			// Clean up interval on component unmount or dependency change
			return () => {
				if (intervalIdRef.current) {
					clearInterval(intervalIdRef.current);
				}
			};
		} else {
			// Clear interval when isVisible becomes false
			if (intervalIdRef.current) {
				clearInterval(intervalIdRef.current);
			}
		}
	}, [isVisible, getDeviceIDs]);

	const handleOpenPopup = () => {
		setIsVisible(true);
	};

	const handleClosePopup = () => {
		setIsVisible(false);
	};

	const handleDeviceSelect = async (deviceId: string) => {
		setIsLoading(true);
		setSelectedDevice(deviceId);
		try {
			const response = await fetch("https://api.spotify.com/v1/me/player", {
				method: "PUT",
				headers: {
					Authorization: `Bearer ${accessToken}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					device_ids: [deviceId],
				}),
			});
			if (!response.ok) {
				throw new Error("Failed to transfer playback to the selected device.");
			}
		} catch (error) {
			const errorMessage = (error as Error).message;
			Alert.alert("Error", errorMessage);
		} finally {
			setIsLoading(false);
		}
	};

	const renderDeviceName = (device: Devices) => {
		let icon = null;
		switch (device.type) {
			case "Smartphone":
				icon = <Icon name="mobile" size={43} color="#555" />;
				break;
			case "Computer":
				icon = <Icon name="desktop" size={30} color="#555" />;
				break;
			// Add more cases for other types as needed
			default:
				break;
		}

		return (
			<View style={styles.deviceNameContainer}>
				{icon}
				<Text style={styles.deviceName}>{device.name}</Text>
			</View>
		);
	};

	return (
		<>
			<TouchableOpacity
				onPress={handleOpenPopup}
				testID="Speaker-button"
				style={{ marginLeft: 10 }}
			>
				<SpeakerIcon />
			</TouchableOpacity>
			<View style={styles.container}>
				<Modal visible={isVisible} transparent={true} animationType="fade">
					<View style={styles.modalBackground}>
						<View style={styles.popupContainer}>
							{error ? (
								<>
									<Text style={styles.popupTitle}>Error Fetching Devices</Text>
									<Text style={styles.popupMessage}>{error}</Text>
								</>
							) : !devices || devices.length === 0 ? (
								<>
									<Text style={styles.popupTitle}>No Devices Available</Text>
									<Text style={styles.popupMessage}>
										Please activate Spotify on at least one of your devices.
									</Text>
								</>
							) : (
								<>
									<Text style={styles.popupTitle}>Select a Device</Text>
									{isLoading ? (
										<ActivityIndicator size="large" color={colors.primary} />
									) : (
										devices.map((device: Devices, index: number) => (
											<TouchableOpacity
												key={index}
												style={styles.deviceOption}
												onPress={() => handleDeviceSelect(device.id)}
											>
												<RadioButton
													value={device.id}
													testID={`radio-button-${device.id}`} // Ensure each radio button has a unique testID
													status={
														selectedDevice === device.id
															? "checked"
															: "unchecked"
													}
												/>
												{renderDeviceName(device)}
											</TouchableOpacity>
										))
									)}
								</>
							)}
							<TouchableOpacity onPress={handleClosePopup}>
								<Text style={styles.closeButtonText}>Close</Text>
							</TouchableOpacity>
						</View>
					</View>
				</Modal>
			</View>
		</>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	modalBackground: {
		flex: 1,
		backgroundColor: "rgba(0, 0, 0, 0.8)",
		justifyContent: "center",
		alignItems: "center",
	},
	popupContainer: {
		backgroundColor: "white",
		padding: 20,
		borderRadius: 15,
		width: 315,
	},
	popupTitle: {
		alignSelf: "center",
		fontSize: 20,
		fontWeight: "bold",
		marginBottom: 20,
	},
	popupMessage: {
		fontSize: 16,
		textAlign: "center",
		marginBottom: 20,
	},
	deviceOption: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 10,
		marginLeft: 20,
	},
	deviceNameContainer: {
		flexDirection: "row",
		alignItems: "center",
	},
	deviceName: {
		fontSize: 16,
		marginLeft: 10,
	},
	closeButtonText: {
		marginTop: 15,
		marginBottom: 5,
		alignSelf: "center",
		color: "black",
		fontSize: 17,
		fontWeight: "bold",
	},
});

export default DevicePicker;
