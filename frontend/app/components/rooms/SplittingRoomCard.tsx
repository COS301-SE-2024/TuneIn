import React from "react";
import {
	View,
	Text,
	StyleSheet,
	Dimensions,
	TouchableOpacity,
	ScrollView,
	ImageBackground,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/FontAwesome";

const SplittingRoomCard: React.FC = () => {
	const { height, width } = Dimensions.get("window");
	const cardHeight = height * 0.8;
	const cardWidth = width * 0.9;
	const upperSectionHeight = cardHeight * 0.5; // 50% of card height
	const lowerSectionHeight = cardHeight * 0.5; // 50% of card height

	// Example data
	const rootParentName = "RootParent";
	const topGenre = "TopGenre";
	const numberOfParticipants = 15;
	const backgroundImage = require("../../assets/jazzBackground.png");

	return (
		<TouchableOpacity
			style={[styles.card, { height: cardHeight, width: cardWidth }]}
		>
			<ImageBackground
				source={backgroundImage}
				style={[
					styles.upperSection,
					{ height: upperSectionHeight, width: cardWidth },
				]}
				imageStyle={styles.backgroundImage}
			>
				<View style={styles.overlay}>
					<Text
						style={styles.roomName}
					>{`${rootParentName} - ${topGenre}`}</Text>
					<View style={styles.peopleCountContainer}>
						<Icon name="users" size={20} color="#000" />
						<Text style={styles.participants}>{numberOfParticipants}</Text>
					</View>
				</View>
				<LinearGradient
					colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.5)", "rgba(0,0,0,0.8)"]}
					style={styles.gradientOverlay}
				/>
			</ImageBackground>
			<ScrollView
				style={[styles.lowerSection, { height: lowerSectionHeight }]}
				contentContainerStyle={styles.scrollViewContent}
			>
				{/* Lower section content goes here */}
			</ScrollView>
		</TouchableOpacity>
	);
};

const styles = StyleSheet.create({
	card: {
		alignItems: "center",
		backgroundColor: "#343434",
		borderRadius: 10,
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
		width: "100%",
	},
	scrollViewContent: {
		justifyContent: "center",
		alignItems: "center",
	},
	backgroundImage: {
		borderRadius: 10,
		opacity: 0.8,
	},
	overlay: {
		flex: 1,
		width: "100%",
		justifyContent: "flex-start", // Align content to the top
		alignItems: "center",
		backgroundColor: "rgba(0, 0, 0, 0.3)", // Dark overlay to improve text visibility
		padding: 10, // Added padding for better spacing
	},
	roomName: {
		fontSize: 24,
		fontWeight: "bold",
		color: "#fff",
		marginTop: 20, // Positioning the room name higher
	},
	participants: {
		fontWeight: "bold",
		fontSize: 16,
		color: "#0d0d0d",
	},
	gradientOverlay: {
		position: "absolute",
		width: "100%",
		height: "100%",
		borderRadius: 10,
		zIndex: 1,
	},
	peopleCountContainer: {
		height: 35,
		width: 80,
		flexDirection: "row",
		alignItems: "center",
		marginTop: 5,
		paddingVertical: 3,
		paddingHorizontal: 10,
		borderWidth: 1,
		borderColor: "#000",
		borderRadius: 20,
		backgroundColor: "#fff",
		position: "absolute", // Absolute positioning
		bottom: 10, // Aligning to the bottom
		right: 10, // Aligning to the right
		zIndex: 2, // Ensure it appears above the gradient
	},
});

export default SplittingRoomCard;
