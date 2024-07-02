import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	StyleSheet,
	Modal,
	TouchableOpacity,
	Alert,
} from "react-native";
import { useSpotifyDevices } from "../hooks/useSpotifyDevices";
import { RadioButton } from "react-native-paper";
import { useSpotifyAuth } from "../hooks/useSpotifyAuth";

const DevicePicker = () => {
	const { getToken } = useSpotifyAuth();
	const [isVisible, setIsVisible] = useState(false);
	const [devices, setDevices] = useState([]);
	const [selectedDevice, setSelectedDevice] = useState(null);
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
		let interval;
		if (isVisible) {
			const fetchDevices = async () => {
				const deviceList = await getDeviceIDs();
				setDevices(deviceList);
				if (deviceList) {
					const activeDevice = deviceList.find((device) => device.is_active);
					if (activeDevice) {
						setSelectedDevice(activeDevice.id);
					}

					if (deviceList && deviceList.length === 0) {
						setIsVisible(true);
					}
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

	const handleDeviceSelect = async (deviceId) => {
		console.log("accessToken: ", accessToken);
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
			console.log(
				"Body : ",
				JSON.stringify({
					device_ids: [deviceId],
				}),
			);
			if (!response.ok) {
				throw new Error("Failed to transfer playback to the selected device.");
			}
		} catch (error) {
			Alert.alert("Error", error.message);
		}
	};

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Previous Screen Content</Text>
			<TouchableOpacity onPress={handleOpenPopup} style={styles.button}>
				<Text style={styles.buttonText}>Open Pop-up</Text>
			</TouchableOpacity>

			<Modal visible={isVisible} transparent={true} animationType="fade">
				<TouchableOpacity
					style={styles.modalBackground}
					activeOpacity={1}
					onPress={handleClosePopup}
				>
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
								{devices.map((device, index) => (
									<View key={index} style={styles.deviceOption}>
										<RadioButton
											value={device.id}
											status={
												selectedDevice === device.id ? "checked" : "unchecked"
											}
											onPress={() => handleDeviceSelect(device.id)}
										/>
										<Text style={styles.deviceButtonText}>{device.name}</Text>
									</View>
								))}
							</>
						)}
						<TouchableOpacity
							onPress={handleClosePopup}
							style={styles.closeButton}
						>
							<Text style={styles.closeButtonText}>Close</Text>
						</TouchableOpacity>
					</View>
				</TouchableOpacity>
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
		borderRadius: 5,
		alignItems: "center",
	},
	popupTitle: {
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
	},
	deviceButtonText: {
		fontSize: 16,
	},
	closeButton: {
		marginTop: 20,
		padding: 10,
		backgroundColor: "blue",
		borderRadius: 5,
	},
	closeButtonText: {
		color: "white",
		fontSize: 16,
		fontWeight: "bold",
	},
});

export default DevicePicker;
