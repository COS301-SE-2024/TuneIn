import React, { useContext, useEffect, useRef } from "react";
import {
	View,
	Text,
	TouchableOpacity,
	StyleSheet,
	Dimensions,
	Image,
	Animated,
} from "react-native";
import { useRouter } from "expo-router";
import { Player } from "../../PlayerContext";
// import Icon from "react-native-vector-icons/FontAwesome";

const Miniplayer: React.FC = () => {
	const windowWidth = Dimensions.get("window").width;
	const playerWidth = windowWidth * 0.95;
	const playerContext = useContext(Player);
	const router = useRouter();
	const animation = useRef(new Animated.Value(0)).current;
	const textAnimation = useRef(new Animated.Value(0)).current;

	if (!playerContext) {
		throw new Error(
			"PlayerContext must be used within a PlayerContextProvider",
		);
	}
	const { currentRoom } = playerContext;

	const combinedLength =
		(currentRoom?.songName?.length || 0) +
		(currentRoom?.artistName?.length || 0);

	useEffect(() => {
		const animateText = () => {
			if (combinedLength > 19) {
				Animated.loop(
					Animated.sequence([
						Animated.timing(textAnimation, {
							toValue: -windowWidth * 0.5,
							duration: 6500,
							useNativeDriver: true,
						}),
						Animated.timing(textAnimation, {
							toValue: windowWidth,
							duration: 0,
							useNativeDriver: true,
						}),
					]),
				).start();
			}
		};
		animateText();
	}, [textAnimation, windowWidth, combinedLength]);

	if (!currentRoom) return null;

	const navigateToRoomPage = () => {
		console.log("Navigating to room page", currentRoom);
		router.push({
			pathname: "/screens/rooms/RoomStack",
			params: { room: JSON.stringify(currentRoom) },
		});
	};

	const animatedStyle = {
		height: animation.interpolate({
			inputRange: [0, 1],
			outputRange: [56, windowWidth], // Adjust as needed for full-screen height
		}),
		width: animation.interpolate({
			inputRange: [0, 1],
			outputRange: [56, windowWidth],
		}),
	};

	const textAnimatedStyle =
		combinedLength > 19 ? { transform: [{ translateX: textAnimation }] } : {};

	return (
		<View style={[{ alignItems: "center" }]}>
			<TouchableOpacity
				style={[styles.container, { width: playerWidth }]}
				onPress={navigateToRoomPage}
				testID="player-touchable"
			>
				<Animated.View style={[styles.imageContainer, animatedStyle]}>
					<Image
						source={
							currentRoom.backgroundImage
								? { uri: currentRoom.backgroundImage }
								: require("../../../assets/imageholder.jpg")
						}
						style={styles.backgroundImage}
						testID="background-image"
					/>
				</Animated.View>
				<View style={styles.textContainer}>
					<Text style={styles.roomName}>{currentRoom.name}</Text>
					<View style={styles.songInfoContainer}>
						<Animated.Text style={[styles.animatedText, textAnimatedStyle]}>
							<Text style={styles.songText}>{currentRoom.songName}</Text>
							{" · "}
							<Text style={styles.songText}>{currentRoom.artistName}</Text>
						</Animated.Text>
					</View>
				</View>
				{/* <View style={styles.peopleCountContainer}>
					<Icon name="users" size={20} color="#000" />
					<Text style={styles.peopleCount}>{NumberOfPeople}</Text>
				</View> */}
				{/* <TouchableOpacity style={styles.leaveButton}>
					<Text>Leave</Text>
				</TouchableOpacity> */}
			</TouchableOpacity>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		borderRadius: 10,
		height: 65,
		flexDirection: "row",
		justifyContent: "space-around",
		alignItems: "center",
		backgroundColor: "#00bdbd",
		paddingBottom: 8,
		elevation: 4,
	},
	imageContainer: {
		overflow: "hidden",
		paddingLeft: 7,
		paddingTop: 5,
	},
	backgroundImage: {
		width: 50,
		height: 50,
		borderRadius: 5,
	},
	textContainer: {
		flex: 1,
		paddingHorizontal: 10,
		paddingTop: 10,
	},
	roomName: {
		fontWeight: "bold",
		fontSize: 17,
	},
	songInfoContainer: {
		flexDirection: "row",
		overflow: "hidden",
		width: "100%",
		marginTop: 5,
	},
	songInfo: {
		flexDirection: "row",
	},
	songText: {
		fontSize: 15,
		fontWeight: "bold",
		color: "grey",
	},
	animatedText: {
		width: "200%", // Ensures the text can scroll properly
	},
	leaveButton: {
		paddingHorizontal: 10,
	},
	peopleCountContainer: {
		flexDirection: "row",
		alignItems: "center",
		marginTop: 5,
		paddingVertical: 3,
		paddingHorizontal: 10,
		borderWidth: 1,
		borderColor: "#000",
		borderRadius: 20,
		backgroundColor: "#fff",
	},
	peopleCount: {
		marginLeft: 5,
		fontSize: 16,
		fontWeight: "bold",
	},
});

export default Miniplayer;
