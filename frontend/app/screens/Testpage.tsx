import React, { useState } from "react";
import { View, Button, StyleSheet } from "react-native";
import DevicePicker from "../components/DevicePicker"; // Replace with the correct path

const DevicePickerTest = () => {
	const [showDevicePicker, setShowDevicePicker] = useState(false);

	return <DevicePicker />;
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 20,
	},
});

export default DevicePickerTest;
