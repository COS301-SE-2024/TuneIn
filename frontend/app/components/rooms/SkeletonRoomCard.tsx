import React from "react";
import {
	View,
	Text,
	ImageBackground,
	Image,
	StyleSheet,
	TouchableOpacity,
	Animated,
	ViewStyle,
} from "react-native";
import { Room } from "../../models/Room";
import { useRouter } from "expo-router";

// interface SkeletonRoomCardProps {
// 	roomCard: Room;
// 	style?: ViewStyle; // Add this line
// }

const SkeletonRoomCard: React.FC<{}> = () => {
	const cardWidth = 320;

	const truncateText = (text: string, maxLength: number) => {
		if (text.length > maxLength) {
			return text.substring(0, maxLength - 3) + "...";
		}
		return text;
	};

	return (
		<Animated.View style={[styles.container, { width: cardWidth }]}>
			<ImageBackground
				// source={null} // No image source provided, which will avoid loading the image.
				style={[styles.imageBackground, { backgroundColor: "#E0E0E0" }]} // Set a light grey background color.
				imageStyle={styles.imageBackgroundStyle}
				testID="room-card-background"
			>
				{/* Add your skeleton loader content here */}
			</ImageBackground>
		</Animated.View>
	);
};

const styles = StyleSheet.create({
	container: {
		margin: 8,
		borderRadius: 15,
		overflow: "hidden",
		height: 210, // Adjust height as needed
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		elevation: 5,
	},
	imageBackground: {
		flex: 1,
	},
	imageBackgroundStyle: {
		borderRadius: 15, // Adjust border radius as needed
	},
	overlay: {
		position: "absolute",
		top: 0,
		bottom: 0,
		left: 0,
		right: 0,
		backgroundColor: "rgba(0, 0, 0, 0.5)",
	},
	textContainer: {
		position: "absolute",
		top: 8,
		left: 8,
		right: 8,
	},
	roomName: {
		fontSize: 18,
		fontWeight: "bold",
		color: "white",
	},
	nowPlaying: {
		fontSize: 14,
		color: "white",
		marginTop: 4,
	},
	nowPlayingBold: {
		fontWeight: "bold",
	},
	contentContainer: {
		flex: 1,
		justifyContent: "flex-end",
		padding: 8,
		borderRadius: 15,
	},
	description: {
		fontSize: 14,
		color: "white",
		marginBottom: 8,
	},
	actionsContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	editButton: {
		backgroundColor: "#1E90FF",
		width: 56,
		height: 56,
		borderRadius: 28,
		justifyContent: "center",
		alignItems: "center",
	},
	editButtonText: {
		fontSize: 24,
		fontWeight: "bold",
		color: "white",
	},
	tags: {
		fontSize: 14,
		color: "white",
	},
	userInfoContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	userAvatarContainer: {
		flexDirection: "row",
		alignItems: "center",
	},
	userAvatar: {
		width: 40,
		height: 40,
		borderRadius: 20,
		marginRight: 8,
	},
	username: {
		fontSize: 16,
		color: "white",
	},
});

export default SkeletonRoomCard;
