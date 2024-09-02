import React, { useMemo, useState, useEffect, useRef } from "react";
import {
	View,
	Text,
	StyleSheet,
	Dimensions,
	ImageBackground,
	Animated,
	PanResponder,
	ScrollView,
	TouchableOpacity,
	NativeSyntheticEvent,
	NativeScrollEvent,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/FontAwesome";
import { colors } from "../styles/colors";
import SongList from "../components/SongList"; // Assuming you have this component

interface Track {
	id: number;
	name: string;
	artists: { name: string }[];
	album: { images: { url: string }[] };
	explicit: boolean;
	preview_url: string;
	uri: string;
	duration_ms: number;
}

type Queues = {
	[key: number]: Track[];
};

const TestPage: React.FC = () => {
	const [currentRoomIndex, setCurrentRoomIndex] = useState(0);
	const [isCollapsed, setIsCollapsed] = useState(false);
	const scrollX = useRef(new Animated.Value(0)).current;
	const animatedHeight = useRef(new Animated.Value(0)).current;

	// Define the rooms and their respective queues
	const rooms = useMemo(
		() => [
			{
				id: 1,
				name: "Room One",
				TopGenre: "smooth jazz",
				BackgroundImage: "https://example.com/album1.jpg",
				participents: 25,
			},
			{
				id: 2,
				name: "Room Two",
				TopGenre: "smooth jazz",
				BackgroundImage: "https://example.com/album1.jpg",
				participents: 30,
			},
		],
		[],
	);

	const queues: Queues = useMemo(
		() => ({
			1: [
				{
					id: 1,
					name: "Song One",
					artists: [{ name: "Artist A" }],
					album: { images: [{ url: "https://example.com/album1.jpg" }] },
					explicit: false,
					preview_url: "https://example.com/preview1.mp3",
					uri: "spotify:track:1",
					duration_ms: 210000,
				},
				{
					id: 2,
					name: "Song Two",
					artists: [{ name: "Artist B" }],
					album: { images: [{ url: "https://example.com/album2.jpg" }] },
					explicit: true,
					preview_url: "https://example.com/preview2.mp3",
					uri: "spotify:track:2",
					duration_ms: 180000,
				},
			],
			2: [
				{
					id: 3,
					name: "Song Three",
					artists: [{ name: "Artist C" }],
					album: { images: [{ url: "https://example.com/album3.jpg" }] },
					explicit: false,
					preview_url: "https://example.com/preview3.mp3",
					uri: "spotify:track:3",
					duration_ms: 200000,
				},
			],
		}),
		[],
	);

	const { width, height } = Dimensions.get("window");
	const cardWidth = width * 0.75;
	const cardHeight = height * 0.55;
	const collapsedHeight = height * 0.3;
	const expandedHeight = height * 0.6;
	const spacing = 25;

	const playlist = queues[rooms[currentRoomIndex]?.id] || []; // Get the queue for the current room

	useEffect(() => {
		console.log("Room in focus:", rooms[currentRoomIndex]?.name);
		Animated.timing(animatedHeight, {
			toValue: isCollapsed ? collapsedHeight : expandedHeight,
			duration: 300,
			useNativeDriver: false,
		}).start();
	}, [
		isCollapsed,
		currentRoomIndex,
		animatedHeight,
		collapsedHeight,
		expandedHeight,
		rooms,
	]);

	const panResponder = PanResponder.create({
		onMoveShouldSetPanResponder: (evt, gestureState) => {
			return Math.abs(gestureState.dy) > 20;
		},
		onPanResponderMove: (evt, gestureState) => {
			const newHeight = isCollapsed
				? collapsedHeight + gestureState.dy
				: expandedHeight + gestureState.dy;
			animatedHeight.setValue(
				Math.max(collapsedHeight, Math.min(expandedHeight, newHeight)),
			);
		},
		onPanResponderRelease: (evt, gestureState) => {
			setIsCollapsed(gestureState.dy < 0);
		},
	});

	return (
		<View style={styles.container}>
			<Animated.FlatList
				data={rooms}
				horizontal
				showsHorizontalScrollIndicator={false}
				pagingEnabled
				keyExtractor={(item) => `room-${item.id}`}
				snapToInterval={cardWidth + spacing}
				decelerationRate="fast"
				contentContainerStyle={styles.flatListContentContainer}
				ListHeaderComponent={<View style={styles.flatListPadding} />}
				ListFooterComponent={<View style={styles.flatListPadding} />}
				onScroll={Animated.event(
					[{ nativeEvent: { contentOffset: { x: scrollX } } }],
					{
						useNativeDriver: true,
						listener: (event: NativeSyntheticEvent<NativeScrollEvent>) => {
							let newIndex: number;
							if (event.nativeEvent.contentOffset.x >= 180) {
								newIndex = 1;
							} else {
								newIndex = 0;
							}
							if (newIndex !== currentRoomIndex) {
								setCurrentRoomIndex(newIndex);
							}
						},
					},
				)}
				bounces={false}
				scrollEventThrottle={16}
				renderItem={({ index }) => {
					const inputRange = [
						(index - 1) * (cardWidth + spacing),
						index * (cardWidth + spacing),
						(index + 1) * (cardWidth + spacing),
					];
					const translateY = scrollX.interpolate({
						inputRange,
						outputRange: [35, -10, 35],
					});

					return (
						<Animated.View
							style={{
								width: cardWidth,
								height: cardHeight,
								transform: [{ translateY }],
								marginHorizontal: spacing / 2,
								elevation: 10,
								borderRadius: 20,
								marginTop: 25,
								overflow: "hidden", // Ensure children respect the rounded borders
							}}
						>
							<ImageBackground
								source={{ uri: rooms[index]?.BackgroundImage }} // Use correct image URL
								style={styles.upperSection}
								imageStyle={styles.backgroundImage} // Apply border radius to image
							>
								<LinearGradient
									colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.7)"]}
									style={styles.gradientOverlay}
								/>
								<View style={styles.cardContent}>
									<Text style={styles.roomName}>{rooms[index]?.name}</Text>
									<Text style={styles.topGenre}>{rooms[index]?.TopGenre}</Text>
									<View style={styles.peopleCountContainer}>
										<Icon name="users" size={20} color="#fff" />
										<Text style={styles.participants}>
											{rooms[index]?.participents}
										</Text>
									</View>
								</View>
							</ImageBackground>
						</Animated.View>
					);
				}}
			/>
			<Animated.View
				style={[styles.drawerContainer, { height: animatedHeight }]}
			>
				<TouchableOpacity
					style={styles.drawerHeader}
					onPress={() => setIsCollapsed((prev) => !prev)}
					{...panResponder.panHandlers}
				>
					<Text style={styles.drawerTitle}>Queue</Text>
					<Icon
						name={isCollapsed ? "chevron-up" : "chevron-down"}
						size={20}
						color="#fff"
					/>
				</TouchableOpacity>
				<ScrollView
					style={styles.lowerSection}
					contentContainerStyle={styles.scrollViewContent}
					nestedScrollEnabled={true}
				>
					{playlist.length > 0 ? (
						playlist.map((track, index) => (
							<SongList
								key={track.id || index}
								songNumber={index + 1}
								track={track}
								showVoting={false}
								isCurrent={index === currentRoomIndex}
								index={index}
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
			</Animated.View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: colors.backgroundColor,
	},
	flatListContentContainer: {
		paddingHorizontal: 18, // Add padding on both sides
	},
	flatListPadding: {
		width: 10, // Adjust this value as needed
	},
	upperSection: {
		justifyContent: "center",
		alignItems: "center",
		width: "100%",
		height: "100%",
	},
	backgroundImage: {
		resizeMode: "cover",
		borderRadius: 20, // Apply border radius to ImageBackground
	},
	cardContent: {
		flex: 1,
		justifyContent: "flex-end",
		alignItems: "center",
		padding: 20,
	},
	roomName: {
		fontSize: 24,
		fontWeight: "bold",
		color: "#fff",
		textAlign: "center",
	},
	topGenre: {
		fontSize: 15,
		fontWeight: "bold",
		color: "#D3D3D3",
		textAlign: "center",
		marginVertical: 10,
	},
	peopleCountContainer: {
		flexDirection: "row",
		alignItems: "center",
		marginTop: 5,
	},
	participants: {
		fontSize: 16,
		color: "#fff",
		marginLeft: 5,
	},
	gradientOverlay: {
		...StyleSheet.absoluteFillObject,
	},
	drawerContainer: {
		position: "absolute",
		bottom: 0,
		width: "98%",
		backgroundColor: "#333",
		borderTopLeftRadius: 15,
		borderTopRightRadius: 15,
		overflow: "hidden",
	},
	drawerHeader: {
		backgroundColor: "#444",
		padding: 10,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		borderBottomColor: "#555",
		borderBottomWidth: 1,
	},
	drawerTitle: {
		fontSize: 18,
		color: "#fff",
	},
	lowerSection: {
		flex: 1,
		padding: 15,
	},
	scrollViewContent: {
		flexGrow: 1,
		justifyContent: "center",
	},
	emptyQueueContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	emptyQueueText: {
		color: "#D3D3D3",
		fontSize: 16,
		textAlign: "center",
	},
});

export default TestPage;
