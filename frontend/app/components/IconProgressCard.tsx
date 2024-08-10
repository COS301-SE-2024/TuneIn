import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { ProgressBar } from "react-native-paper"; // You'll need to install react-native-paper if not already installed
import Entypo from "@expo/vector-icons/Entypo"; // Example icon library

interface IconProgressCardProps {
	icon: string; // Icon name for Ionicons
	iconColor?: string; // Optional color for the icon
	header: string; // Header text
	number: string | number; // Number under the header
	progress: number; // Progress value (0 to 1)
}

const IconProgressCard: React.FC<IconProgressCardProps> = ({
	icon,
	iconColor = "#08BDBD", // Default color if not provided
	header,
	number,
	progress,
}) => {
	return (
		<View style={styles.card}>
			<Entypo name={icon} size={32} color={iconColor} style={styles.icon} />
			<View style={styles.textContainer}>
				<Text style={styles.header}>{header}</Text>
				<Text style={styles.number}>{number}</Text>
				<ProgressBar
					progress={progress}
					color={iconColor}
					style={styles.progressBar}
				/>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	card: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#fff",
		borderRadius: 8,
		padding: 15,
		marginVertical: 10,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		elevation: 5,
	},
	icon: {
		marginRight: 15,
	},
	textContainer: {
		flex: 1,
	},
	header: {
		fontSize: 18,
		fontWeight: "500",
	},
	number: {
		fontSize: 24,
		fontWeight: "bold",
		marginTop: 5,
	},
	progressBar: {
		marginTop: 10,
		height: 10,
		borderRadius: 5,
	},
});

export default IconProgressCard;
