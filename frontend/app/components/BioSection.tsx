import React from "react";
import { View, Text, StyleSheet, ViewStyle, TextStyle } from "react-native";

interface BioSectionProps {
	content: string;
}

const BioSection: React.FC<BioSectionProps> = ({ content }) => {
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
	} as ViewStyle,
	title: {
		fontSize: 20,
		fontWeight: "600",
		paddingBottom: 10,
	} as TextStyle,
	content: {
		fontSize: 14,
		fontWeight: "400",
	} as TextStyle,
	button: {
		width: 155,
		height: 37,
		backgroundColor: "rgba(158, 171, 184, 1)",
		borderRadius: 18.5,
		justifyContent: "center",
		alignItems: "center",
	} as ViewStyle,
	buttonText: {
		color: "black",
		fontWeight: "600",
	} as TextStyle,
});

export default BioSection;
