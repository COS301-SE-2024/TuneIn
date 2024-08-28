import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Tabs from "../components/Tabs";

const SomeScreen: React.FC = () => {
	return (
		<View style={styles.container}>
			{/* Other content of SomeScreen */}
			<Text style={styles.title}>Welcome to Some Screen</Text>

			{/* Insert Tabs component here */}
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
	title: {
		fontSize: 20,
		fontWeight: "bold",
		marginBottom: 20,
	},
});

export default SomeScreen;
