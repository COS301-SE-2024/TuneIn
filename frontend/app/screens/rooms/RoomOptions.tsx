import React, { useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	ScrollView,
	Image,
} from "react-native";
import { useRouter } from "expo-router";
import {
	FontAwesome5,
	MaterialIcons,
	MaterialCommunityIcons,
	Entypo,
	FontAwesome,
} from "@expo/vector-icons";

const RoomOptions = () => {
	const router = useRouter();

	const [isBookmarked, setIsBookmarked] = useState(false);

	const room = {
		name: "Cool Jazz",
		host: "John Doe",
		image:
			"https://images.pexels.com/photos/3792581/pexels-photo-3792581.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
	};

	const toggleBookmark = () => {
		setIsBookmarked(!isBookmarked);
	};

	const goToAddSongPage = () => {
		router.navigate("/screens/AddSongPage");
	};

	const goToRoomInfoScreen = () => {
		router.navigate("/screens/RoomInfo");
	};

	const goToPlaylist = () => {
		router.navigate("/screens/rooms/Playlist");
	};

	const goToHome = () => {
		router.navigate("/screens/Home");
	};

	return (
		<ScrollView contentContainerStyle={styles.container}>
			<View style={styles.textContainer}>
				<Text style={styles.roomName}>{room.name}</Text>
				<Text style={styles.host}>{room.host}</Text>
			</View>

			<Image source={{ uri: room.image }} style={styles.image} />

			<TouchableOpacity style={styles.button} onPress={toggleBookmark}>
				<View style={styles.buttonContent}>
					{isBookmarked ? (
						<FontAwesome name="bookmark" size={20} color="black" />
					) : (
						<FontAwesome5 name="bookmark" size={20} color="#08BDBD" />
					)}
					<Text style={styles.buttonText}>Bookmark room</Text>
				</View>
			</TouchableOpacity>

			<TouchableOpacity style={styles.button} onPress={goToAddSongPage}>
				<View style={styles.buttonContent}>
					<MaterialIcons name="playlist-add" size={24} color="black" />
					<Text style={styles.buttonText}>Add song to queue</Text>
				</View>
			</TouchableOpacity>

			<TouchableOpacity style={styles.button} onPress={goToRoomInfoScreen}>
				<View style={styles.buttonContent}>
					<MaterialCommunityIcons
						name="card-account-details-outline"
						size={24}
						color="black"
					/>
					<Text style={styles.buttonText}>Room details</Text>
				</View>
			</TouchableOpacity>

			<TouchableOpacity style={styles.playlistContainer} onPress={goToPlaylist}>
				<View style={styles.buttonContent}>
					<MaterialCommunityIcons
						name="playlist-play"
						size={24}
						color="black"
					/>
					<Text style={styles.playlistText}>Playlist</Text>
				</View>
			</TouchableOpacity>

			<TouchableOpacity style={styles.button}>
				<View style={styles.buttonContent}>
					<MaterialIcons name="save-alt" size={24} color="black" />
					<Text style={styles.buttonText}>Save playlist</Text>
				</View>
			</TouchableOpacity>

			<TouchableOpacity style={styles.button}>
				<View style={styles.buttonContent}>
					<Entypo name="share" size={20} color="black" />
					<Text style={styles.buttonText}>Share room</Text>
				</View>
			</TouchableOpacity>

			<TouchableOpacity style={styles.playlistContainer} onPress={goToHome}>
				<View style={styles.buttonContent}>
					<Text style={styles.playlistText}>Leave Room</Text>
				</View>
			</TouchableOpacity>

			<TouchableOpacity
				style={styles.closeButton}
				onPress={() => router.back()}
			>
				<Text style={styles.closeButtonText}>Close</Text>
			</TouchableOpacity>

			{/* <SvgUri
        width="100%"
        height="100%"
        source={require('./assets/images/rectangle252.svg')}
      /> */}
		</ScrollView>
	);
};

const styles = StyleSheet.create({
	container: {
		backgroundColor: "white",
		alignItems: "center",
		padding: 20,
	},
	textContainer: {
		alignItems: "center",
	},
	roomName: {
		color: "black",
		fontFamily: "Poppins",
		fontSize: 32,
		textAlign: "center",
		marginVertical: 10,
		fontWeight: "bold",
	},
	host: {
		color: "#8B8FA8",
		fontFamily: "Poppins",
		fontSize: 14,
		textAlign: "center",
	},
	image: {
		width: 200,
		height: 200,
		marginVertical: 20,
		borderRadius: 12,
	},
	button: {
		width: 259,
		height: 43,
		justifyContent: "center",
		alignItems: "center",
		marginVertical: 5,
	},
	buttonContent: {
		flexDirection: "row",
		alignItems: "center",
	},
	buttonText: {
		color: "black",
		fontFamily: "Poppins",
		fontSize: 16,
		marginLeft: 8,
	},
	playlistContainer: {
		width: 242,
		height: 52,
		justifyContent: "center",
		alignItems: "center",
		marginVertical: 5,
	},
	playlistText: {
		color: "black",
		fontFamily: "Poppins",
		fontSize: 16,
		marginLeft: 8,
	},
	closeButton: {
		marginTop: 20,
	},
	closeButtonText: {
		color: "black",
		fontFamily: "Poppins",
		fontSize: 16,
	},
});

export default RoomOptions;
