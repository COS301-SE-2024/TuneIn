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
import * as utils from "../../services/Utils";
import { router } from "expo-router";
import { Player } from "../../PlayerContext";
import { useContext } from "react";
import { useLive } from "../../LiveContext";
import { useAPI } from "../../APIContext";
import { User } from "../../models/user";

// Define the prop types using an interface
interface ContextMenuProps {
	isVisible: boolean;
	onClose: () => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ isVisible, onClose }) => {
	const { currentRoom, socketHandshakes, leaveRoom, leaveDM } = useLive();
	const { rooms } = useAPI();
	// Navigation functions
	const navigateToAnalytics = () => {
		router.navigate("/screens/analytics/AnalyticsPage");
		onClose(); // Close the modal after navigation
	};

	const navigateToLogout = async () => {
		await auth.default
			.getToken()
			.then(async (token) => {
				if (currentRoom) {
					leaveRoom();
					await rooms.leaveRoom(currentRoom.roomID);
				}
				if (socketHandshakes.dmJoined) {
					leaveDM();
				}
				onClose(); // Close the modal after logout
				await auth.default.logout();
				console.log("OS: " + Platform.OS);
				if (Platform.OS === "android") {
					ToastAndroid.show("You have been logged out.", ToastAndroid.SHORT);
				} else {
					alert("You have been logged out.");
				}
			})
			.catch((error) => {
				console.log("Error getting token: " + error);
			});
	};

	const navigateToHelp = () => {
		router.navigate("/screens/(tabs)/HelpScreen");
		onClose(); // Close the modal after navigation
	};

	const navigateToBlockedUsers = async () => {
		const token = await auth.default.getToken();
		const result = await fetch(`${utils.API_BASE_URL}/users/blocked`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
		});
		if (result.ok) {
			const data = await result.json();
			const blockedUsers: User = data.map((item: any) => ({
				id: item.userID,
				profile_picture_url: item.profile_picture_url,
				profile_name: item.profile_name,
				username: item.username,
				followers: item.followers.data,
			}));
			console.log("Blocked Users: ", blockedUsers);
			router.push({
				pathname: "./MorePage",
				params: {
					type: "user",
					items: JSON.stringify(blockedUsers),
					title: "Blocked Users",
				},
			});
		}
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
					<TouchableOpacity
						onPress={navigateToBlockedUsers}
						style={styles.menuItem}
					>
						<Text style={styles.menuText}>
							<Ionicons name="close" size={20} color="black" />
							{"  "}
							Blocked Users
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
