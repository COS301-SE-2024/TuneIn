import React, { useState, useEffect } from "react";
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
import { useSpotifyAuth } from "../hooks/useSpotifyAuth";

const DevicePicker = () => {
	const { getToken } = useSpotifyAuth();
	const [isVisible, setIsVisible] = useState(false); // Corrected initialization
	const [devices, setDevices] = useState([] as any[]); // Corrected initialization
	const [selectedDevice, setSelectedDevice] = useState<string | undefined>(
		undefined,
	); // Corrected initialization
	const [isLoading, setIsLoading] = useState(false);
	const { getDeviceIDs } = useSpotifyDevices();
	const [accessToken, setAccessToken] = useState<string>("");

	useEffect(() => {
		const fetchToken = async () => {
			try {
				const token = await getToken();
				setAccessToken(token);
			} catch (err) {
				console.error("An error occurred while fetching the token", err);
			}
		};

		fetchToken();
	}, [getToken]);

	useEffect(() => {
		let interval: NodeJS.Timeout;

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

			fetchDevices();
			interval = setInterval(fetchDevices, 4000);
		} else {
			clearInterval(interval);
		}

		return () => clearInterval(interval);
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
		setTimeout(async () => {
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
					throw new Error(
						"Failed to transfer playback to the selected device.",
					);
				}
			} catch (error) {
				Alert.alert("Error", error.message);
			} finally {
				setIsLoading(false);
			}
		}, 500); // 2 seconds delay
	};
	return (
		<View style={styles.container}>
			<Text style={styles.title}>Previous Screen Content</Text>
			<TouchableOpacity onPress={handleOpenPopup} style={styles.button}>
				<Text style={styles.buttonText}>Open Pop-up</Text>
			</TouchableOpacity>

			<Modal visible={isVisible} transparent={true} animationType="fade">
				<View style={styles.modalBackground}>
					<View style={styles.popupContainer}>
						{!devices || devices.length === 0 ? (
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
									<ActivityIndicator size="large" color="blue" />
								) : (
									devices.map((device, index) => (
										<TouchableOpacity
											key={index}
											style={styles.deviceOption}
											onPress={() => handleDeviceSelect(device.id)}
										>
											<RadioButton
												value={device.id}
												testID={`radio-button-${device.id}`} // Ensure each radio button has a unique testID
												status={device.is_active ? "checked" : "unchecked"}
											/>
											<Text style={styles.deviceButtonText}>{device.name}</Text>
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
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	title: {
		fontSize: 20,
		fontWeight: "bold",
		marginBottom: 20,
	},
	button: {
		backgroundColor: "blue",
		padding: 10,
		borderRadius: 5,
		marginBottom: 20,
	},
	buttonText: {
		color: "white",
		fontSize: 16,
		fontWeight: "bold",
	},
	modalBackground: {
		flex: 1,
		backgroundColor: "rgba(0, 0, 0, 0.5)",
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
	deviceButtonText: {
		fontSize: 16,
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
