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

interface RoomCardWidgetProps {
	roomCard: Room;
	style?: ViewStyle; // Add this line
}

const RoomCardWidget: React.FC<RoomCardWidgetProps> = ({ roomCard }) => {
	const cardWidth = 320;
	const router = useRouter();
	const room = JSON.parse(JSON.stringify(roomCard));

	// console.log("roomCard", roomCard);
	const navigateToEditRoom = () => {
		router.navigate({
			pathname: "/screens/rooms/EditRoom",
			params: { room: JSON.stringify(room) },
		});
	};

	const navigateToRoomPage = () => {
		console.log("Room:", room);
		router.navigate({
			pathname: "/screens/rooms/RoomPage",
			params: { room: JSON.stringify(room) },
		});
	};

	const renderSongInfo = () => {
		if (!roomCard.songName || !roomCard.artistName) {
			return <Text style={styles.nowPlaying}>No song playing</Text>;
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

	const truncateText = (text: string, maxLength: number) => {
		if (text.length > maxLength) {
			return text.substring(0, maxLength - 3) + "...";
		}
		return text;
	};

	return (
		<TouchableOpacity onPress={navigateToRoomPage}>
			<Animated.View style={[styles.container, { width: cardWidth }]}>
				<ImageBackground
					source={{ uri: roomCard.backgroundImage }}
					style={styles.imageBackground}
					imageStyle={styles.imageBackgroundStyle}
					testID="room-card-background"
				>
					<View style={styles.overlay} />
					<View style={styles.textContainer}>
						<Text style={styles.roomName}>
							{truncateText(roomCard.name, 20)}
						</Text>
						{renderSongInfo()}
					</View>
					<View style={styles.contentContainer}>
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
								<Text style={styles.tags}>{roomCard.tags.join(" • ")}</Text>
							</View>
						) : (
							<View style={styles.userInfoContainer}>
								<View style={styles.userAvatarContainer}>
									<Image
										source={{ uri: roomCard.userProfile }}
										style={styles.userAvatar}
									/>
									<Text style={styles.username}>{roomCard.username}</Text>
								</View>
								<Text style={styles.tags}>{roomCard.tags.join(" • ")}</Text>
							</View>
						)}
					</View>
				</ImageBackground>
			</Animated.View>
		</TouchableOpacity>
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

export default RoomCardWidget;
