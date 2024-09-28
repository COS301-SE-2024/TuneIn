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
import { colors } from "../../styles/colors";

interface RoomCardWidgetProps {
	roomCard: Room;
	style?: ViewStyle; // Add this line
}

const RoomCardWidget: React.FC<RoomCardWidgetProps> = ({ roomCard }) => {
	const cardWidth = 280;
	const router = useRouter();
	const room = JSON.parse(JSON.stringify(roomCard));

	const currentDate = new Date();
	const startDate = new Date(roomCard.start_date);
	const endDate = new Date(roomCard.end_date);

	const isBeforeStartDate = currentDate < startDate;
	const isAfterEndDate = currentDate > endDate;

	const navigateToEditRoom = () => {
		router.navigate({
			pathname: "/screens/rooms/EditRoom",
			params: { room: JSON.stringify(room) },
		});
	};

	const navigateToRoomPage = () => {
		router.navigate({
			pathname: "/screens/rooms/RoomStack",
			params: { room: JSON.stringify(room) },
		});
	};

	const renderSongInfo = () => {
		if (!roomCard.songName || !roomCard.artistName) {
			return <Text style={styles.nowPlaying}></Text>;
		}

		return (
			<Text style={styles.nowPlaying}>
				Now playing:{" "}
				<Text style={styles.nowPlayingBold}>
					{truncateText(roomCard.songName, 20)}
				</Text>{" "}
				by{" "}
				<Text style={styles.nowPlayingBold}>
					{truncateText(roomCard.artistName, 20)}
				</Text>
			</Text>
		);
	};

	const truncateText = (text: string | undefined, maxLength: number) => {
		if (text && text.length > maxLength) {
			return text.substring(0, maxLength - 3) + "...";
		}
		return text;
	};

	const displayTagText = () => {
		let adjustedTags = roomCard.tags.join(" • ");
		if (adjustedTags.length > 20) {
			const tags = roomCard.tags;
			adjustedTags = tags.slice(0, -1).join(" • ");
		}
		return adjustedTags;
	};

	const renderOverlayText = () => {
		if (isBeforeStartDate) {
			return (
				<View style={styles.overlayTextContainer}>
					<Text style={styles.overlayText}>This room will start on</Text>
					<Text style={styles.overlayText}>
						{startDate.toLocaleDateString("en-GB", {
							day: "2-digit",
							month: "short",
							year: "numeric",
						})}
					</Text>
					<Text style={styles.overlayText}>
						{startDate.toLocaleTimeString([], {
							hour: "2-digit",
							minute: "2-digit",
						})}
					</Text>
				</View>
			);
		}
		if (isAfterEndDate) {
			return (
				<View style={styles.overlayTextContainer}>
					<Text style={styles.overlayText}>This room ended on</Text>
					<Text style={styles.overlayText}>
						{endDate.toLocaleDateString("en-GB", {
							day: "2-digit",
							month: "short",
							year: "numeric",
						})}
					</Text>
					<Text style={styles.overlayText}>
						{endDate.toLocaleTimeString([], {
							hour: "2-digit",
							minute: "2-digit",
						})}
					</Text>
				</View>
			);
		}
		return null;
	};

	return (
		<TouchableOpacity
			onPress={navigateToRoomPage}
			// disabled={!roomCard.mine || isBeforeStartDate || isAfterEndDate}
		>
			<Animated.View style={[styles.container, { width: cardWidth }]}>
				<ImageBackground
					source={
						roomCard.backgroundImage
							? { uri: roomCard.backgroundImage }
							: require("../../../assets/imageholder.jpg") // Fallback image
					}
					style={styles.imageBackground}
					imageStyle={styles.imageBackgroundStyle}
					testID="room-card-background"
				>
					<View
						style={[
							styles.overlay,
							// isBeforeStartDate || isAfterEndDate ? styles.greyOverlay : {},
						]}
					/>
					{/* {(isBeforeStartDate || isAfterEndDate) && (
						<Text style={styles.overlayText}>{renderOverlayText()}</Text>
					)} */}
					<View style={styles.textContainer}>
						<Text style={styles.roomName}>
							{truncateText(roomCard.name, 20)}
						</Text>
						{renderSongInfo()}
					</View>
					<View style={styles.contentContainer}>
						{/* {!isBeforeStartDate && !isAfterEndDate && (
	
						)} */}
						<Text style={styles.description}>
							{truncateText(roomCard.description, 100)}
						</Text>
						{roomCard.mine ? (
							<View style={styles.actionsContainer}>
								<TouchableOpacity
									style={styles.editButton}
									onPress={navigateToEditRoom}
								>
									<Text style={styles.editButtonText}>✎</Text>
								</TouchableOpacity>
								<Text style={styles.tags}>{displayTagText()}</Text>
							</View>
						) : (
							<View style={styles.userInfoContainer}>
								<View style={styles.userAvatarContainer}>
									<Image
										source={{ uri: roomCard.userProfile }}
										style={styles.userAvatar}
									/>
									<Text style={styles.username}>
										{truncateText(roomCard.username, 13)}
									</Text>
								</View>
								<Text style={styles.tags}>{displayTagText()}</Text>
							</View>
						)}
					</View>
					{/* Conditionally render explicit icon */}
					{roomCard.isExplicit && (
						<Image
							source={require("../../../assets/Explicit.png")}
							style={styles.explicitIcon}
						/>
					)}
				</ImageBackground>
			</Animated.View>
		</TouchableOpacity>
	);
};

const styles = StyleSheet.create({
	container: {
		borderRadius: 15,
		overflow: "hidden",
		height: 190, // Adjust height as needed
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
	greyOverlay: {
		backgroundColor: "rgba(128, 128, 128, 0.95)", // Grey overlay
	},
	overlayTextContainer: {
		alignItems: "center",
		justifyContent: "center",
		textAlign: "center",
		paddingTop: 50,
		paddingLeft: 32,
	},
	overlayText: {
		color: "white",
		fontSize: 16,
		fontWeight: "bold",
		textAlign: "center",
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
		backgroundColor: colors.primary,
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
		marginRight: 15,
	},
	explicitIcon: {
		width: 26,
		height: 26,
		position: "absolute", // Use absolute positioning
		top: 10, // Position from the bottom
		right: 10, // Position from the right
	},
});

export default RoomCardWidget;
