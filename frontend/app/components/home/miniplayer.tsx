import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";

const Miniplayer: React.FC = () => {
	const windowWidth = Dimensions.get("window").width;
	const playerWidth = windowWidth * 0.97;

	return (
		<View style={[{ alignItems: "center" }]}>
			<View style={[styles.container, { width: playerWidth }]}>
				{/* Add your other components here */}
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		borderRadius: 10,
		height: 56,
		flexDirection: "row",
		justifyContent: "space-around",
		alignItems: "center",
		backgroundColor: "#00bdbd",
		paddingBottom: 8, // Add padding to the bottom
		elevation: 4, // Elevation for Android shadow
	},
});

export default Miniplayer;
