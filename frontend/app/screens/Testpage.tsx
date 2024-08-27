import React, { useMemo } from "react";
import {
	View,
	Text,
	StyleSheet,
	Dimensions,
	FlatList,
	ImageBackground,
	Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/FontAwesome";
import { colors } from "../styles/colors";

const TestPage: React.FC = () => {
	const scrollX = React.useRef(new Animated.Value(0)).current;
	const sampleQueue = useMemo(
		() => [
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
		[],
	);

	const { width, height } = Dimensions.get("window");
	const cardWidth = width * 0.7;
	const cardHeight = height * 0.6;
	const spacing = 20;

	return (
		<View style={styles.container}>
			<Animated.FlatList
				data={sampleQueue}
				horizontal
				showsHorizontalScrollIndicator={false}
				pagingEnabled
				keyExtractor={(item) => `room-${item.id}`}
				snapToInterval={cardWidth + spacing}
				decelerationRate="fast"
				contentContainerStyle={{ paddingHorizontal: spacing / 2 }}
				onScroll={Animated.event(
					[{ nativeEvent: { contentOffset: { x: scrollX } } }],
					{ useNativeDriver: true },
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
									<Text style={styles.roomName}>{`Room ${index + 1}`}</Text>
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
		color: "#D3D3D3",
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
});

export default TestPage;
