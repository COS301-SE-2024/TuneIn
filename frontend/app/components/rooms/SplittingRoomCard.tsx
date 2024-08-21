import React from "react";
import {
	View,
	Text,
	StyleSheet,
	Dimensions,
	TouchableOpacity,
	ScrollView,
} from "react-native";

const SplittingRoomCard: React.FC = () => {
	const { height, width } = Dimensions.get("window");
	const cardHeight = height * 0.8;
	const cardWidth = width * 0.9;
	const upperSectionHeight = cardHeight * 0.4; // 40% of card height
	const lowerSectionHeight = cardHeight * 0.6; // 60% of card height

	return (
		<TouchableOpacity
			style={[styles.card, { height: cardHeight, width: cardWidth }]}
		>
			<View
				style={[styles.upperSection, { height: upperSectionHeight }]}
			></View>
			<ScrollView
				style={[styles.lowerSection, { height: lowerSectionHeight }]}
				contentContainerStyle={styles.scrollViewContent}
			></ScrollView>
		</TouchableOpacity>
	);
};

const styles = StyleSheet.create({
	card: {
		backgroundColor: "#343434",
		borderRadius: 10,
		padding: 20,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 8,
		elevation: 5,
	},
	upperSection: {
		justifyContent: "center",
		alignItems: "center",
		borderBottomWidth: 1,
		borderBottomColor: "#ddd",
	},
	lowerSection: {
		padding: 10,
	},
	scrollViewContent: {
		justifyContent: "center",
		alignItems: "center",
	},
	title: {
		fontSize: 24,
		fontWeight: "bold",
		marginBottom: 10,
	},
	description: {
		fontSize: 16,
		textAlign: "center",
	},
});

export default SplittingRoomCard;
