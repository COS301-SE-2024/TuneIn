import React, { useState, useEffect, useRef } from "react";
import {
	View,
	Text,
	StyleSheet,
	Modal,
	TouchableOpacity,
	TouchableWithoutFeedback,
	ActivityIndicator,
} from "react-native";
import { RadioButton } from "react-native-paper";
import Icon from "react-native-vector-icons/FontAwesome"; // Example: using FontAwesome icons
import { colors } from "../styles/colors";
import { useLive } from "../LiveContext";
import { Device } from "@spotify/web-api-ts-sdk";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

const DevicePicker = ({
	isVisible,
	setIsVisible,
}: {
	isVisible: boolean;
	setIsVisible: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
	const { roomControls } = useLive();
	// const [isVisible, setIsVisible] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const intervalIdRef = useRef<NodeJS.Timeout>();
	const [localDevices, setLocalDevices] = useState<Device[]>(
		roomControls.playbackHandler.spotifyDevices.devices,
	);
	const [localActiveDevice, setLocalActiveDevice] = useState<
		Device | undefined
	>(roomControls.playbackHandler.activeDevice);

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

	useEffect(() => {
		console.log(`The first DevicePicker useEffect`);
		const contextDevices: Device[] =
			roomControls.playbackHandler.spotifyDevices.devices;
		if (contextDevices.length !== localDevices.length) {
			setLocalDevices(contextDevices);
		} else {
			for (let i = 0; i < contextDevices.length; i++) {
				if (contextDevices[i].id !== localDevices[i].id) {
					setLocalDevices(contextDevices);
					break;
				}
			}
		}
		if (roomControls.playbackHandler.activeDevice) {
			if (
				!localActiveDevice ||
				roomControls.playbackHandler.activeDevice.id !== localActiveDevice.id
			) {
				setLocalActiveDevice(roomControls.playbackHandler.activeDevice);
			}
		}
	}, [
		roomControls.playbackHandler.spotifyDevices.devices,
		roomControls.playbackHandler.activeDevice,
	]);

	useEffect(() => {
		console.log(`The other DevicePicker useEffectttttttttttt`);
		if (!intervalIdRef.current) {
			intervalIdRef.current = setInterval(() => {
				console.log("Running useEffect as per 1000ms interval");
				if (isVisible) {
					setIsLoading(true);
					roomControls.playbackHandler.getDevices().then(() => {
						setIsLoading(false);
					});
				}
			}, 5000);
		}
		if (!isVisible) {
			clearInterval(intervalIdRef.current);
			intervalIdRef.current = undefined;
		} else {
			//once DevicePicker is visible, fetch devices
			roomControls.playbackHandler.getDevices().then(() => {
				setIsLoading(false);
			});
		}
		return () => {
			clearInterval(intervalIdRef.current);
			intervalIdRef.current = undefined;
		};
	}, [isVisible]);

	return (
		<>
			<TouchableOpacity
				onPress={handleOpenPopup}
				testID="Speaker-button"
				style={{ marginLeft: 0 }}
			>
				<MaterialIcons name="speaker" size={34} color="black" />
			</TouchableOpacity>
			<View style={styles.container}>
				<Modal visible={isVisible} transparent={true} animationType="slide">
					<TouchableWithoutFeedback onPress={handleClosePopup}>
						<View style={styles.modalBackground} testID="modalBackground">
							<TouchableWithoutFeedback>
								<View style={styles.popupContainer}>
									{roomControls.playbackHandler.deviceError ? (
										<>
											<Text style={styles.popupTitle}>
												Error Fetching Devices
											</Text>
											<Text style={styles.popupMessage}>
												{roomControls.playbackHandler.deviceError}
											</Text>
										</>
									) : localDevices.length === 0 ? (
										<>
											<Text style={styles.popupTitle}>
												No Devices Available
											</Text>
											<Text style={styles.popupMessage}>
												Please activate Spotify on at least one of your devices.
											</Text>
										</>
									) : (
										<>
											<Text style={styles.popupTitle}>Select a Device</Text>
											{isLoading ? (
												<ActivityIndicator
													testID="ActivityIndicator"
													size="large"
													color={colors.primary}
												/>
											) : (
												localDevices.map((device: Device, index: number) => (
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
														{device.id !== null && (
															<RadioButton
																value={device.id}
																testID={`radio-button-${device.id}`}
																status={
																	localActiveDevice &&
																	localActiveDevice.id === device.id
																		? "checked"
																		: "unchecked"
																}
															/>
														)}
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
							</TouchableWithoutFeedback>
						</View>
					</TouchableWithoutFeedback>
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
		justifyContent: "flex-end",
	},
	popupContainer: {
		backgroundColor: "white",
		padding: 20,
		borderTopLeftRadius: 15,
		borderTopRightRadius: 15,
		width: "100%",
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
