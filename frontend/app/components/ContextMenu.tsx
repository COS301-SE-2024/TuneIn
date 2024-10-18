import React from "react";
import { View, TouchableOpacity, Text, StyleSheet, Modal } from "react-native";
import Foundation from "@expo/vector-icons/Foundation";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

// Define the prop types using an interface
interface ContextMenuProps {
	isVisible: boolean;
	onClose: () => void;
	onAdvancedSettings: () => void;
	onBanUserList: () => void;
	onRoomInfo: () => void;
	onShareRoom: () => void;
	onSavePlaylist: () => void;
	isHost: boolean;
	onSeeChildRooms?: () => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({
	isVisible,
	onClose,
	onAdvancedSettings,
	onBanUserList,
	onRoomInfo,
	onShareRoom,
	onSavePlaylist,
	isHost,
	onSeeChildRooms,
}) => {
	return (
		<Modal transparent visible={isVisible} animationType="fade">
			<TouchableOpacity
				style={styles.overlay}
				onPress={onClose}
				testID="overlay"
			>
				<View style={styles.menuContainer}>
					{/* Conditional rendering based on user ownership */}
					{/* {isHost ? (
						<TouchableOpacity
							onPress={onAdvancedSettings}
							style={styles.menuItem}
						>
							<Text style={styles.menuText}>Advanced Settings</Text>
						</TouchableOpacity>
					) : (
						<TouchableOpacity onPress={onRoomInfo} style={styles.menuItem}>
							<Text style={styles.menuText}>Room Info</Text>
						</TouchableOpacity>
					)} */}
					{isHost && (
						<TouchableOpacity
							onPress={onAdvancedSettings}
							style={styles.menuItem}
						>
							<Text style={styles.menuText}>Advanced Settings</Text>
						</TouchableOpacity>
					)}

					<TouchableOpacity onPress={onBanUserList} style={styles.menuItem}>
						<Text style={styles.menuText}>Banned Users</Text>
					</TouchableOpacity>

					<TouchableOpacity onPress={onRoomInfo} style={styles.menuItem}>
						<Text style={styles.menuText}>Room Info</Text>
					</TouchableOpacity>
					<TouchableOpacity onPress={onSavePlaylist} style={styles.menuItem}>
						<Text style={styles.menuText}>
							{/* <MaterialIcons name="save-alt" size={24} color="black" /> */}
							<MaterialCommunityIcons
								name="playlist-plus"
								size={24}
								color="black"
							/>
							{"  "}
							Save Playlist
						</Text>
					</TouchableOpacity>
					{onSeeChildRooms && (
						<TouchableOpacity onPress={onSeeChildRooms} style={styles.menuItem}>
							<Text style={styles.menuText}>
								<MaterialCommunityIcons
									name="link-variant"
									size={24}
									color="black"
								/>
								{"  "}
								Sub-Rooms
							</Text>
						</TouchableOpacity>
					)}
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
