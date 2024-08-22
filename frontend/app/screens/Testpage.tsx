import React from "react";
import { colors } from "../styles/colors";
import SplittingRoomCard from "../components/rooms/SplittingRoomCard";
import { View, StyleSheet } from "react-native";

const TestPage: React.FC = () => {
	return (
		<View style={styles.container}>
			<SplittingRoomCard />
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center", // Centers vertically
		alignItems: "center", // Centers horizontally
		backgroundColor: "#353535",
		padding: 20,
	},
});

export default TestPage;
