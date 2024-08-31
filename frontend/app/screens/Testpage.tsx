import React, { useMemo, useState, useEffect, useRef } from "react";
import {
	View,
	Text,
	StyleSheet,
	Dimensions,
	FlatList,
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
	const firstRoom = useRef(true); // Changed to useRef

	// Define the rooms and their respective queues
	const rooms = useMemo(
		() => [
			{ id: 1, name: "Room One" },
			{ id: 2, name: "Room Two" },
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
	const cardWidth = width * 0.7;
	const cardHeight = height * 0.6;
	const collapsedHeight = height * 0.3;
	const expandedHeight = height * 0.6;
	const spacing = 20;

	const playlist = queues[rooms[currentRoomIndex]?.id] || []; // Get the queue for the current room

	useEffect(() => {
		console.log("Room in focus:", rooms[currentRoomIndex]?.name);
		Animated.timing(animatedHeight, {
			toValue: isCollapsed ? collapsedHeight : expandedHeight,
			duration: 300,
			useNativeDriver: false,
		}).start();
	}, [isCollapsed, currentRoomIndex]);

	const switchRoom = () => {
		firstRoom.current = !firstRoom.current; // Use useRef instead of boolean variable
		if (firstRoom.current) {
			setCurrentRoomIndex(0);
		} else {
			setCurrentRoomIndex(1);
		}
	};

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
				contentContainerStyle={{ paddingHorizontal: spacing / 2 }}
				onScroll={Animated.event(
					[{ nativeEvent: { contentOffset: { x: scrollX } } }],
					{
						useNativeDriver: true,
						listener: (event: NativeSyntheticEvent<NativeScrollEvent>) => {
							let newIndex: number; // Corrected the syntax here
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
						outputRange: [0, -50, 0],
					});

					return (
						<Animated.View
							style={{
								width: cardWidth,
								height: cardHeight,
								transform: [{ translateY }],
								marginHorizontal: spacing / 2,
							}}
						>
							<View
								style={[styles.card, { height: cardHeight, width: cardWidth }]}
							>
								<ImageBackground
									source={require("../assets/jazzBackground.png")}
									style={[
										styles.upperSection,
										{ height: cardHeight, width: cardWidth },
									]}
									imageStyle={styles.backgroundImage}
								>
									<LinearGradient
										colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.7)"]}
										style={styles.gradientOverlay}
									/>
									<Text style={styles.roomName}>{rooms[index]?.name}</Text>
									<Text style={styles.topGenre}>
										{index === 0 ? "Smooth Jazz" : "Chill Beats"}
									</Text>
									<View style={styles.peopleCountContainer}>
										<Icon name="users" size={20} color="#000" />
										<Text style={styles.participants}>
											{index === 0 ? 25 : 30}
										</Text>
									</View>
								</ImageBackground>
							</View>
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
		padding: 20,
	},
	card: {
		alignItems: "center",
		backgroundColor: "#2C2C2C",
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
	backgroundImage: {
		resizeMode: "cover",
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
		color: "#000",
		marginLeft: 5,
	},
	gradientOverlay: {
		...StyleSheet.absoluteFillObject,
	},
	drawerContainer: {
		position: "absolute",
		bottom: 0,
		width: "100%",
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
