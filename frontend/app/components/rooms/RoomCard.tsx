import React from "react";
import { View, Text, ImageBackground, StyleSheet } from "react-native";

interface RoomCardProps {
	roomName: string;
	songName?: string;
	artistName?: string;
	username?: string;
	imageUrl: string; // Assuming this is backgroundImage
}

const RoomCard: React.FC<RoomCardProps> = ({
	roomName,
	songName,
	artistName,
	username,
	imageUrl,
}) => {
	const renderSongInfo = () => {
		if (!songName || !artistName) {
			return <Text style={styles.nowPlaying}>No song playing</Text>;
		}

		return (
			<Text style={styles.nowPlaying}>
				Now playing:{" "}
				<Text style={styles.nowPlayingBold}>{truncateText(songName, 20)}</Text>{" "}
				by{" "}
				<Text style={styles.nowPlayingBold}>
					{truncateText(artistName, 20)}
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
		<View style={styles.container}>
			<ImageBackground
				source={{ uri: imageUrl }}
				style={styles.imageBackground}
				imageStyle={styles.imageBackgroundStyle}
			>
				<View style={styles.overlay} />
				<View style={styles.textContainer}>
					<Text style={styles.roomName}>{truncateText(roomName, 20)}</Text>
					{renderSongInfo()}
				</View>
				{/* Additional content here */}
			</ImageBackground>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		margin: 8,
		borderRadius: 15,
		overflow: "hidden",
		height: 210, // Adjust height as needed
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
	// Additional styles as needed
});

export default RoomCard;
