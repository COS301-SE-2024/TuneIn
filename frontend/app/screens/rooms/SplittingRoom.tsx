import React, { useMemo, useState, useEffect, useRef } from "react";
import {
	View,
	Text,
	StyleSheet,
	Dimensions,
	ImageBackground,
	Animated,
	TouchableOpacity,
	NativeSyntheticEvent,
	NativeScrollEvent,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../../styles/colors";
import { Room, formatRoomData } from "../../models/Room";

const placeholderImage = require("../../../assets/imageholder.jpg");

const SplittingRoom: React.FC = () => {
	const router = useRouter();
	const { rooms: roomsParam } = useLocalSearchParams();
	const [currentRoomIndex, setCurrentRoomIndex] = useState(0);
	const scrollX = useRef(new Animated.Value(0)).current;
	const [activeGenres, setActiveGenres] = useState<string[]>([]);

	const rooms: Room[] = useMemo(() => {
		try {
			const parsedRooms = JSON.parse(roomsParam as string);
			return parsedRooms.map((room: any) => formatRoomData(room));
		} catch (error) {
			console.error("Failed to parse rooms:", error);
			return [];
		}
	}, [roomsParam]);

	useEffect(() => {
		if (rooms[currentRoomIndex]) {
			const genres = rooms[currentRoomIndex].tags;
			setActiveGenres(genres || []);
		}
	}, [currentRoomIndex, rooms]);

	const { width, height } = Dimensions.get("window");
	const cardWidth = width * 0.75;
	const cardHeight = height * 0.55; // Increased card height
	const spacing = 25;

	const navigateToRoomPage = (room: Room) => {
		router.navigate({
			pathname: "/screens/rooms/RoomStack",
			params: { room: JSON.stringify(room) },
		});
	};

	return (
		<View style={styles.container}>
			{/* Header with back chevron and centered title */}
			<View style={styles.header}>
				<TouchableOpacity onPress={() => router.back()}>
					<Ionicons name="chevron-back" size={24} color="#000" />
				</TouchableOpacity>
				<Text style={styles.pageTitle}>Room Explorer</Text>
			</View>
			<View style={styles.headerBottomLine} />
			{/* Grey line at the bottom of the header */}
			{/* Room Cards */}
			<Animated.FlatList
				data={rooms}
				testID="rooms-flat-list"
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
								{/* Image with grey overlay */}
								<ImageBackground
									source={
										item?.backgroundImage
											? { uri: item.backgroundImage }
											: placeholderImage
									}
									style={styles.upperSection}
									imageStyle={styles.backgroundImage}
								>
									<View style={styles.greyOverlay} />
									<LinearGradient
										colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.7)"]}
									/>
									<View style={styles.cardContent}>
										<Text style={styles.roomName}>{item?.name}</Text>
									</View>
								</ImageBackground>
							</Animated.View>
						</TouchableOpacity>
					);
				}}
			/>
			{/* Genre Pills Section */}
			<View style={styles.genreSection}>
				<Text style={styles.genreSectionTitle}>Genres</Text>
				<View style={styles.genreBottomLine} />
				<View style={styles.genrePillsContainer}>
					{activeGenres.map((genre, index) => (
						<View key={index} style={styles.genrePill}>
							<Text style={styles.genreText}>{genre}</Text>
						</View>
					))}
				</View>
				{/* Line at the bottom of the genres */}
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: "center",
		backgroundColor: colors.backgroundColor,
	},
	header: {
		width: "100%",
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: 20,
		paddingBottom: 5,
		height: 50,
		backgroundColor: "white",
	},
	pageTitle: {
		fontSize: 20,
		fontWeight: "bold",
		color: colors.primaryText,
		textAlign: "center",
		flex: 1,
	},
	headerBottomLine: {
		height: 1,
		width: "100%",
		backgroundColor: "#C0C0C0", // Grey line color
	},
	flatListContentContainer: {
		marginTop: 30,
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
		fontSize: 25,
		fontWeight: "bold",
		color: "#fff",
		textAlign: "center",
	},
	greyOverlay: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: "rgba(0, 0, 0, 0.5)", // Grey out the image
		borderRadius: 20,
	},
	genreSection: {
		width: "95%", // Adjust to take up 95% of the width
		height: "25%", // Height remains the same
		position: "absolute", // Position relative to the screen
		bottom: 0, // Stick it to the bottom of the screen
		backgroundColor: colors.backgroundColor, // Light background to distinguish
		alignItems: "center",
		justifyContent: "flex-start", // Align to start to position the title higher
		borderRadius: 15,
		shadowColor: "#000",
		shadowOpacity: 0.3,
		shadowRadius: 10,
		elevation: 5, // Add elevation for distinction
		paddingTop: 10, // Space above the title
	},
	genreSectionTitle: {
		fontSize: 20,
		fontWeight: "bold",
		color: colors.primaryText,
	},
	genrePillsContainer: {
		flexDirection: "row",
		flexWrap: "wrap",
		justifyContent: "center",
	},
	genrePill: {
		backgroundColor: colors.primary,
		paddingVertical: 5,
		paddingHorizontal: 10,
		borderRadius: 15,
		margin: 5,
	},
	genreText: {
		color: "#fff",
		fontWeight: "bold",
		marginBottom: 2, // Space below the title
	},
	genreBottomLine: {
		height: 2,
		width: "93%", // Takes up 80% of the width
		backgroundColor: "#C0C0C0",
		marginTop: 5, // Space above the line
	},
});

export default SplittingRoom;
