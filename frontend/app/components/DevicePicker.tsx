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
import { RadioButton } from "react-native-paper";
import Icon from "react-native-vector-icons/FontAwesome"; // Example: using FontAwesome icons
import SpeakerIcon from "./Spotify/SpeakerIcon"; // Import SVG components
import { colors } from "../styles/colors";
import { useLive } from "../LiveContext";
import { Device } from "@spotify/web-api-ts-sdk";

const DevicePicker = () => {
	const { roomControls } = useLive();
	const [isVisible, setIsVisible] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const intervalIdRef = useRef<NodeJS.Timeout | null>(null);

	useEffect(() => {
		// Declare intervalId using useRef to ensure it maintains its value across renders
		if (isVisible) {
			const fetchDevices = async () => {
				try {
					const deviceList: Device[] =
						await roomControls.playbackHandler.getDevices();
					console.log("deviceList: ", deviceList);
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
	}, [
		isVisible,
		roomControls.playbackHandler,
		roomControls.playbackHandler.spotifyDevices.devices,
	]);

	const handleOpenPopup = () => {
		setIsVisible(true);
	};

	const handleClosePopup = () => {
		setIsVisible(false);
	};

	const renderDeviceName = (device: Device) => {
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
							{roomControls.playbackHandler.deviceError ? (
								<>
									<Text style={styles.popupTitle}>Error Fetching Devices</Text>
									<Text style={styles.popupMessage}>
										{roomControls.playbackHandler.deviceError}
									</Text>
								</>
							) : !roomControls.playbackHandler.spotifyDevices.devices ||
							  roomControls.playbackHandler.spotifyDevices.devices.length ===
									0 ? (
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
										roomControls.playbackHandler.spotifyDevices.devices.map(
											(device: Device, index: number) =>
												device.id !== null && (
													<TouchableOpacity
														key={index}
														style={styles.deviceOption}
														onPress={() =>
															roomControls.playbackHandler.setActiveDevice({
																deviceID: device.id,
																userSelected: true,
															})
														}
													>
														<RadioButton
															value={device.id}
															testID={`radio-button-${device.id}`} // Ensure each radio button has a unique testID
															status={
																roomControls.playbackHandler.activeDevice ===
																device
																	? "checked"
																	: "unchecked"
															}
														/>
														{renderDeviceName(device)}
													</TouchableOpacity>
												),
										)
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
