import React, { useContext } from "react";
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

const Miniplayer: React.FC = () => {
	const windowWidth = Dimensions.get("window").width;
	const playerWidth = windowWidth * 0.95;
	const playerContext = useContext(Player);
	const router = useRouter();
	const animation = new Animated.Value(0);

	if (!playerContext) {
		throw new Error(
			"PlayerContext must be used within a PlayerContextProvider",
		);
	}
	const { currentRoom } = playerContext;

	if (!currentRoom) return null;

	const navigateToRoomPage = () => {
		router.push({
			pathname: "/screens/rooms/RoomPage",
			params: { room: JSON.stringify(currentRoom) },
		});
	};

	const animateOpen = () => {
		Animated.timing(animation, {
			toValue: 1,
			duration: 300,
			useNativeDriver: false,
		}).start(() => {
			navigateToRoomPage();
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

	return (
		<View style={[{ alignItems: "center" }]}>
			<TouchableOpacity
				style={[styles.container, { width: playerWidth }]}
				onPress={animateOpen}
			>
				<Animated.View style={[styles.imageContainer, animatedStyle]}>
					<Image
						source={{ uri: currentRoom.backgroundImage }}
						style={styles.backgroundImage}
					/>
				</Animated.View>
				<View style={styles.textContainer}>
					<Text style={styles.roomName}>{currentRoom.name}</Text>
					<Text>{currentRoom.songName}</Text>
					<Text>{currentRoom.artistName}</Text>
				</View>
				<TouchableOpacity style={styles.leaveButton}>
					<Text>Leave</Text>
				</TouchableOpacity>
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
		borderRadius: 10,
	},
	backgroundImage: {
		width: 65,
		height: 55,
		borderRadius: 10,
	},
	textContainer: {
		flex: 1,
		paddingHorizontal: 10,
	},
	roomName: {
		fontWeight: "bold",
	},
	leaveButton: {
		paddingHorizontal: 10,
	},
});

export default Miniplayer;
