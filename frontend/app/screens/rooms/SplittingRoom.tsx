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
import { useLocalSearchParams, useRouter } from "expo-router"; // Import useRouter
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/FontAwesome";
import { colors } from "../../styles/colors";
import SongList from "../../components/SongList"; // Assuming you have this component
import { Room, formatRoomData } from "../../models/Room"; // Importing Room type and formatter

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
	[key: string]: Track[];
};

const SplittingRoom: React.FC = () => {
	const router = useRouter(); // Initialize the router
	const { queues: queuesParam, rooms: roomsParam } = useLocalSearchParams();
	const [currentRoomIndex, setCurrentRoomIndex] = useState(0);
	const [isCollapsed, setIsCollapsed] = useState(false);
	const scrollX = useRef(new Animated.Value(0)).current;
	const animatedHeight = useRef(new Animated.Value(0)).current;
	const [playlist, setPlaylist] = useState<Track[]>([]);
	const [queues, setQueues] = useState<Queues>({});

	// Get room data from searchParams and format it
	const rooms: Room[] = useMemo(() => {
		try {
			const parsedRooms = JSON.parse(roomsParam as string);
			return parsedRooms.map((room: any) => formatRoomData(room));
		} catch (error) {
			console.error("Failed to parse rooms:", error);
			return [];
		}
	}, [roomsParam]);

	// Set queues from searchParams
	useEffect(() => {
		try {
			const parsedQueues = JSON.parse(queuesParam as string);
			if (typeof parsedQueues === "object" && parsedQueues !== null) {
				const formattedQueues: Queues = Object.fromEntries(
					Object.entries(parsedQueues).map(([key, queue]) => {
						if (Array.isArray(queue)) {
							return [key, queue.slice(0, 2)]; // Ensure size 2 for each queue
						}
						return [key, []]; // Default to empty array if not an array
					}),
				);
				setQueues(formattedQueues);
				setPlaylist(formattedQueues[Object.keys(formattedQueues)[0]] || []); // Initialize with the first queue
			}
		} catch (error) {
			console.error("Failed to parse queues:", error);
		}
	}, [queuesParam]);

	const { width, height } = Dimensions.get("window");
	const cardWidth = width * 0.75;
	const cardHeight = height * 0.55;
	const collapsedHeight = height * 0.3;
	const expandedHeight = height * 0.6;
	const spacing = 25;

	useEffect(() => {
		Animated.timing(animatedHeight, {
			toValue: isCollapsed ? collapsedHeight : expandedHeight,
			duration: 300,
			useNativeDriver: false,
		}).start();
	}, [isCollapsed, animatedHeight, collapsedHeight, expandedHeight]);

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

	const navigateToRoomPage = (room: Room) => {
		console.log("Room:", room);
		router.navigate({
			pathname: "/screens/rooms/RoomPage",
			params: { room: JSON.stringify(room) },
		});
	};

	return (
		<View style={styles.container}>
			<Animated.FlatList
				data={rooms}
				horizontal
				showsHorizontalScrollIndicator={false}
				pagingEnabled
				keyExtractor={(item) => `room-${item.roomID}`}
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
							const newIndex = Math.round(
								event.nativeEvent.contentOffset.x / (cardWidth + spacing),
							);
							if (newIndex !== currentRoomIndex) {
								setCurrentRoomIndex(newIndex);
								if (rooms[newIndex]?.roomID && queues[rooms[newIndex].roomID]) {
									setPlaylist(queues[rooms[newIndex].roomID]);
								} else {
									setPlaylist([]); // Default to empty playlist
								}
							}
						},
					},
				)}
				bounces={false}
				scrollEventThrottle={16}
				renderItem={({ item, index }) => {
					const inputRange = [
						(index - 1) * (cardWidth + spacing),
						index * (cardWidth + spacing),
						(index + 1) * (cardWidth + spacing),
					];
					const translateY = scrollX.interpolate({
						inputRange,
						outputRange: [40, -10, 40],
					});

					return (
						<TouchableOpacity
							onPress={() => navigateToRoomPage(item)} // Navigate on press
							style={{
								width: cardWidth,
								height: cardHeight,
								marginHorizontal: spacing / 2,
								borderRadius: 20,
								marginTop: 25,
								overflow: "hidden",
							}}
						>
							<Animated.View
								style={{
									width: cardWidth,
									height: cardHeight,
									transform: [{ translateY }],
								}}
							>
								<ImageBackground
									source={{ uri: item?.backgroundImage }}
									style={styles.upperSection}
									imageStyle={styles.backgroundImage}
								>
									<LinearGradient
										colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.7)"]}
										style={styles.gradientOverlay}
									/>
									<View style={styles.cardContent}>
										<Text style={styles.roomName}>{item?.name}</Text>
										<Text style={styles.topGenre}>{item?.genre}</Text>
										<View style={styles.peopleCountContainer}>
											<Icon name="users" size={20} color="#fff" />
											<Text style={styles.participants}>
												{item?.roomSize || 0}
											</Text>
										</View>
									</View>
								</ImageBackground>
							</Animated.View>
						</TouchableOpacity>
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
							<Text style={styles.emptyQueueText}>The queue is empty</Text>
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
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: colors.backgroundColor,
	},
	flatListContentContainer: {
		paddingHorizontal: 15,
	},
	flatListPadding: {
		width: 10,
	},
	upperSection: {
		justifyContent: "center",
		alignItems: "center",
		width: "100%",
		height: "100%",
	},
	backgroundImage: {
		resizeMode: "cover",
		borderRadius: 20,
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
		fontSize: 18,
		color: "#fff",
		marginBottom: 10,
	},
	peopleCountContainer: {
		flexDirection: "row",
		alignItems: "center",
	},
	participants: {
		fontSize: 18,
		fontWeight: "bold",
		color: "#fff",
		marginLeft: 5,
	},
	drawerContainer: {
		width: "99%",
		position: "absolute",
		bottom: 0,
		backgroundColor: colors.primary,
		borderTopLeftRadius: 15,
		borderTopRightRadius: 15,
		overflow: "hidden",
		paddingLeft: 10,
		paddingRight: 10,
	},
	drawerHeader: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		padding: 20,
	},
	drawerTitle: {
		color: "#fff",
		fontSize: 24,
		fontWeight: "bold",
		textAlign: "center",
		marginRight: 10,
	},
	lowerSection: {
		flex: 1,
		width: "100%",
	},
	scrollViewContent: {
		paddingBottom: 80,
	},
	emptyQueueContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	emptyQueueText: {
		fontSize: 18,
		color: "#fff",
		textAlign: "center",
	},
	gradientOverlay: {
		...StyleSheet.absoluteFillObject,
		borderRadius: 20,
	},
});

export default SplittingRoom;
