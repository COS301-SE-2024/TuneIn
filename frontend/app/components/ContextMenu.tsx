import React, { useState } from "react";
import { View, TouchableOpacity, Text, StyleSheet, Modal } from "react-native";
import Foundation from "@expo/vector-icons/Foundation";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import RoomShareSheet from "./messaging/RoomShareSheet";
import { Room } from "../models/Room";

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
	room: Room; // Add room prop to pass it to RoomShareSheet
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
	room, // Use room in the component
}) => {
	console.log("room in context: " + room);
	const [isShareSheetVisible, setIsShareSheetVisible] = useState(false);

	const handleSharePress = () => {
		setIsShareSheetVisible(true);
	};

	const handleCloseShareSheet = () => {
		setIsShareSheetVisible(false);
	};

	return (
		<>
			<Modal transparent visible={isVisible} animationType="fade">
				<TouchableOpacity
					style={styles.overlay}
					onPress={onClose}
					testID="overlay"
				>
					<View style={styles.menuContainer}>
						{isHost ? (
							<>
								<TouchableOpacity
									onPress={onAdvancedSettings}
									style={styles.menuItem}
								>
									<Text style={styles.menuText}>Advanced Settings</Text>
								</TouchableOpacity>

								<TouchableOpacity
									onPress={onBanUserList}
									style={styles.menuItem}
								>
									<Text style={styles.menuText}>Banned Users</Text>
								</TouchableOpacity>
							</>
						) : (
							<TouchableOpacity onPress={onRoomInfo} style={styles.menuItem}>
								<Text style={styles.menuText}>Room Info</Text>
							</TouchableOpacity>
						)}

						{/* <TouchableOpacity
							onPress={handleSharePress} // Use handleSharePress here
							style={styles.menuItem}
						>
							<Text style={styles.menuText}>
								<Foundation name="share" size={16} color="black" />
								{"  "}
								Share
							</Text>
						</TouchableOpacity> */}

						<TouchableOpacity onPress={onSavePlaylist} style={styles.menuItem}>
							<Text style={styles.menuText}>
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
							<TouchableOpacity
								onPress={onSeeChildRooms}
								style={styles.menuItem}
							>
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

			{/* RoomShareSheet component for sharing the room */}
			<RoomShareSheet
				room={room}
				isVisible={isShareSheetVisible}
				onClose={handleCloseShareSheet}
			/>
		</>
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
