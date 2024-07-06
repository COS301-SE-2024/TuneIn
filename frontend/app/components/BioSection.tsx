import React from "react";
import { View, Text, StyleSheet } from "react-native";

const BioSection = ({ content }) => {
	return (
		<View style={styles.container}>
			<Text style={styles.title}>Bio</Text>
			<Text style={styles.content}>{content}</Text>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		marginBottom: 20,
		width: 300,
	},
	title: {
		fontSize: 20,
		fontWeight: "600",
		paddingBottom: 10,
	},
	content: {
		fontSize: 14,
		fontWeight: "400",
	},
	button: {
		width: 155,
		height: 37,
		backgroundColor: "rgba(158, 171, 184, 1)",
		borderRadius: 18.5,
		justifyContent: "center",
		alignItems: "center",
	},
	buttonText: {
		color: "black",
		fontWeight: "600",
	},
});

export default BioSection;
