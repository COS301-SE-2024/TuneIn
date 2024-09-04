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

	const navigateToRoom = () => {
		router.push({
			pathname: "/screens/rooms/RoomDetail", // Update this path to match your room detail screen
			params: {
				roomID: room.roomID,
			},
		});
	};

	return (
		<TouchableOpacity style={styles.card} onPress={navigateToRoom}>
			<ImageBackground
				source={{ uri: room.backgroundImage }}
				style={styles.backgroundImage}
				imageStyle={styles.backgroundImageStyle}
			>
				<View style={styles.overlay}>
					<View style={styles.header}>
						<Image
							source={{ uri: room.userProfile }}
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
		marginBottom: 20,
		borderRadius: 15,
		overflow: "hidden",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
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
