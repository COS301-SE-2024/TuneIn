import {
	View,
	TouchableOpacity,
	Text,
	StyleSheet,
	Modal,
	Platform,
	ToastAndroid,
} from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Ionicons from "@expo/vector-icons/Ionicons"; // Import for icons
import * as auth from "../../services/AuthManagement";
import { router } from "expo-router";
import CurrentRoom from "../../screens/rooms/functions/CurrentRoom";
import { Player } from "../../PlayerContext";
import { useContext } from "react";

// Define the prop types using an interface
interface ContextMenuProps {
	isVisible: boolean;
	onClose: () => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ isVisible, onClose }) => {
	const playerContext = useContext(Player);
	if (!playerContext) {
		throw new Error(
			"PlayerContext must be used within a PlayerContextProvider",
		);
	}
	// Navigation functions
	const navigateToAnalytics = () => {
		router.navigate("/screens/analytics/AnalyticsPage");
		onClose(); // Close the modal after navigation
	};

	const navigateToLogout = async () => {
		await auth.default
			.getToken()
			.then(async (token) => {
				const current = new CurrentRoom();
				const currentRoom = await current.getCurrentRoom(token as string);
				if (currentRoom) {
					const currentRoomID = currentRoom?.roomID ?? currentRoom.id;
					await current.leaveJoinRoom(token as string, currentRoomID, true);
				}
				onClose(); // Close the modal after logout
				await auth.default.logout();
				console.log("OS: " + Platform.OS);
				if (Platform.OS === "android") {
					ToastAndroid.show("You have been logged out.", ToastAndroid.SHORT);
				} else {
					alert("You have been logged out.");
				}
				const { setCurrentRoom } = playerContext;
				setCurrentRoom(null);
			})
			.catch((error) => {
				console.log("Error getting token: " + error);
			});
	};

	const navigateToHelp = () => {
		router.navigate("/screens/(tabs)/HelpScreen");
		onClose(); // Close the modal after navigation
	};

	return (
		<Modal transparent visible={isVisible} animationType="fade">
			<TouchableOpacity
				style={styles.overlay}
				onPress={onClose}
				testID="overlay"
			>
				<View style={styles.menuContainer}>
					{/* Analytics Option */}
					<TouchableOpacity
						onPress={navigateToAnalytics}
						style={styles.menuItem}
					>
						<Text style={styles.menuText}>
							<Ionicons name="stats-chart" size={20} color="black" />
							{"  "}
							Analytics
						</Text>
					</TouchableOpacity>

					{/* Help Menu Option */}
					<TouchableOpacity onPress={navigateToHelp} style={styles.menuItem}>
						<Text style={styles.menuText}>
							<Ionicons name="help-circle" size={20} color="black" />
							{"  "}
							Help Menu
						</Text>
					</TouchableOpacity>

					{/* Logout Option */}
					<TouchableOpacity onPress={navigateToLogout} style={styles.menuItem}>
						<Text style={styles.menuText}>
							<MaterialCommunityIcons name="logout" size={24} color="black" />
							{"  "}
							Logout
						</Text>
					</TouchableOpacity>
				</View>
			</TouchableOpacity>
		</Modal>
	);
};

const styles = StyleSheet.create({
	overlay: {
		flex: 1,
		backgroundColor: "rgba(0, 0, 0, 0.5)",
		justifyContent: "center",
		alignItems: "center",
	},
	menuContainer: {
		position: "absolute", // Use absolute positioning
		top: 50, // Adjust the value to control vertical positioning
		right: 10, // Adjust the value to control horizontal positioning
		width: 200,
		backgroundColor: "white",
		borderRadius: 10,
		padding: 10,
		elevation: 5,
	},
	menuItem: {
		padding: 10,
	},
	menuText: {
		fontSize: 16,
		color: "#000",
	},
});

export default ContextMenu;
