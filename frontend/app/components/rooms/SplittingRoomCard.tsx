import React, { useEffect, useState, useMemo } from "react";
import {
	View,
	Text,
	StyleSheet,
	Dimensions,
	ScrollView,
	ImageBackground,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/FontAwesome";
import SongList from "../../components/SongList";
import { Track } from "../../models/Track";
import { colors } from "../../styles/colors";

interface SplittingRoomCardProps {
	queueData: Track[]; // Pass queue data as props
	currentTrackIndex: number;
	rootParentName: string;
	topGenre: string;
	numberOfParticipants: number;
	backgroundImageSource: any; // Adjust type based on your image import method
}

const SplittingRoomCard: React.FC<SplittingRoomCardProps> = ({
	queueData,
	currentTrackIndex,
	rootParentName,
	topGenre,
	numberOfParticipants,
	backgroundImageSource,
}) => {
	const { height, width } = Dimensions.get("window");
	const cardHeight = height * 0.8;
	const cardWidth = width * 0.9;
	const upperSectionHeight = cardHeight * 0.4; // 40% of card height
	const lowerSectionHeight = cardHeight * 0.6; // 60% of card height

	// Initialize playlist using useState
	const [playlist, setPlaylist] = useState<Track[]>([]);

	// Memoize the queue data to prevent unnecessary re-renders
	const memoizedQueue = useMemo(() => queueData, [queueData]);

	// Update playlist when memoizedQueue changes
	useEffect(() => {
		if (memoizedQueue && memoizedQueue.length > 0) {
			setPlaylist(memoizedQueue);
		}
	}, [memoizedQueue]);

	return (
		<View style={[styles.card, { height: cardHeight, width: cardWidth }]}>
			<ImageBackground
				source={backgroundImageSource}
				style={[
					styles.upperSection,
					{ height: upperSectionHeight, width: cardWidth },
				]}
				imageStyle={styles.backgroundImage}
			>
				<LinearGradient
					colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.7)"]}
					style={styles.gradientOverlay}
				/>
				<Text style={styles.roomName}>{rootParentName}</Text>
				<Text style={styles.topGenre}>{topGenre}</Text>
				<View style={styles.peopleCountContainer}>
					<Icon name="users" size={20} color="#000" />
					<Text style={styles.participants}>{numberOfParticipants}</Text>
				</View>
			</ImageBackground>
			<ScrollView
				style={[styles.lowerSection, { height: lowerSectionHeight }]}
				contentContainerStyle={styles.scrollViewContent}
			>
				{playlist.length > 0 ? (
					playlist.map((track, index) => (
						<SongList
							key={track.id || index}
							songNumber={index + 1}
							track={track}
							showVoting={false}
							isCurrent={index === currentTrackIndex}
							index={index} // Pass the index prop
						/>
					))
				) : (
					<View style={styles.emptyQueueContainer}>
						<Text style={styles.emptyQueueText}>
							The queue is empty. Add some songs to get started!
						</Text>
					</View>
				)}
			</ScrollView>
		</View>
	);
};

const styles = StyleSheet.create({
	card: {
		alignItems: "center",
		backgroundColor: colors.backgroundColor,
		borderRadius: 10,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 8,
		elevation: 5,
		overflow: "hidden",
	},
	upperSection: {
		justifyContent: "center",
		alignItems: "center",
		position: "relative",
	},
	lowerSection: {
		paddingTop: 20,
		padding: 10,
		width: "100%",
	},
	scrollViewContent: {
		paddingBottom: 20,
	},
	backgroundImage: {
		width: "100%",
		height: "100%",
		resizeMode: "cover",
	},
	roomName: {
		fontSize: 29,
		fontWeight: "bold",
		color: "#fff",
		textAlign: "center",
		marginBottom: 5,
	},
	topGenre: {
		fontSize: 20,
		color: "#D3D3D3", // Light grey color for the top genre
		textAlign: "center",
	},
	participants: {
		fontWeight: "bold",
		fontSize: 16,
		color: "#0d0d0d",
		marginLeft: 5,
	},
	gradientOverlay: {
		position: "absolute",
		height: "70%",
		left: 0,
		right: 0,
		bottom: -5,
	},
	peopleCountContainer: {
		flexDirection: "row",
		alignItems: "center",
		marginTop: 10,
		paddingVertical: 5,
		paddingHorizontal: 15,
		borderRadius: 20,
		backgroundColor: "#fff",
	},
	emptyQueueContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: 20,
	},
	emptyQueueText: {
		fontSize: 18,
		textAlign: "center",
		color: "#888",
	},
});

export default SplittingRoomCard;
