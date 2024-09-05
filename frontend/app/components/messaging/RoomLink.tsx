import React from "react";
import {
	View,
	Text,
	ImageBackground,
	StyleSheet,
	TouchableOpacity,
	Image,
} from "react-native";
import { useRouter } from "expo-router";
import { Room } from "../../models/Room";

interface RoomLinkProps {
	room: Room;
}

const RoomLink: React.FC<RoomLinkProps> = ({ room }) => {
	const router = useRouter();

	// Default local images
	const defaultBackgroundImage = require("../../../assets/imageholder.jpg");
	const defaultProfileImage = require("../../../assets/DefaultProfileIcon.webp");

	const navigateToRoom = () => {
		router.push({
			pathname: "/screens/rooms/RoomPage",
			params: { room: JSON.stringify(room) },
		});
	};

	return (
		<TouchableOpacity style={styles.card} onPress={navigateToRoom}>
			<ImageBackground
				source={
					room.backgroundImage
						? { uri: room.backgroundImage }
						: defaultBackgroundImage
				}
				style={styles.backgroundImage}
				imageStyle={styles.backgroundImageStyle}
			>
				<View style={styles.overlay}>
					<View style={styles.header}>
						<Image
							source={
								room.userProfile
									? { uri: room.userProfile }
									: defaultProfileImage
							}
							style={styles.profileImage}
						/>
						<Text style={styles.username}>{room.username}</Text>
					</View>
					<Text style={styles.roomName}>{room.name}</Text>
					<Text style={styles.description}>{room.description}</Text>
					<View style={styles.footer}>
						<Text style={styles.genre}>{room.genre}</Text>
						{room.isExplicit && <Text style={styles.explicit}>Explicit</Text>}
						{room.isNsfw && <Text style={styles.nsfw}>NSFW</Text>}
					</View>
				</View>
			</ImageBackground>
		</TouchableOpacity>
	);
};

const styles = StyleSheet.create({
	card: {
		width: "100%",
		height: 200,
		marginBottom: 20,
		borderRadius: 15,
		overflow: "hidden",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.3,
		shadowRadius: 4,
		elevation: 5,
	},
	backgroundImage: {
		width: "100%",
		height: 200,
		justifyContent: "flex-end",
	},
	backgroundImageStyle: {
		borderRadius: 15,
	},
	overlay: {
		backgroundColor: "rgba(0, 0, 0, 0.5)",
		padding: 15,
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 10,
	},
	profileImage: {
		width: 40,
		height: 40,
		borderRadius: 20,
		marginRight: 10,
		borderColor: "black",
		borderWidth: 1,
	},
	username: {
		color: "#fff",
		fontWeight: "bold",
		fontSize: 16,
	},
	roomName: {
		color: "#fff",
		fontSize: 18,
		fontWeight: "bold",
		marginBottom: 5,
	},
	description: {
		color: "#ddd",
		fontSize: 14,
		marginBottom: 10,
	},
	footer: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	genre: {
		color: "#fff",
		fontSize: 12,
	},
	explicit: {
		color: "#FF3B30",
		fontSize: 12,
		marginLeft: 10,
	},
	nsfw: {
		color: "#FF9500",
		fontSize: 12,
		marginLeft: 10,
	},
});

export default RoomLink;
