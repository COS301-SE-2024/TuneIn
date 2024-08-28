// SomeScreen.tsx
import React from "react";
import { View, StyleSheet } from "react-native";
import Tabs from "./../components/Tabs";

const SomeScreen: React.FC = () => {
	return (
		<View style={styles.container}>
			<Tabs />
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 16,
		backgroundColor: "#f0f0f0",
	},
});

export default SomeScreen;
