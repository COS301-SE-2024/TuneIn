import React, { useEffect, useState } from "react";
import {
	View,
	Text,
	Image,
	StyleSheet,
	TouchableOpacity,
	FlatList,
	Modal,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../styles/colors";
import * as utils from "../../services/Utils";
import auth from "../../services/AuthManagement";
import { useLocalSearchParams } from "expo-router";

interface Participant {
	id: string;
	username: string;
	profilePictureUrl: string;
}

interface BannedUsersProps {
	bannedUsers?: Participant[]; // Make bannedUsers optional
}

const BannedUsers: React.FC<BannedUsersProps> = () => {
	const navigation = useNavigation();
	const router = useLocalSearchParams();
	const { room } = router;
	const [bannedUsersArray, setBannedUsersarray] = useState<Participant[]>([]);
	const [selectedParticipant, setSelectedParticipant] =
		useState<Participant | null>(null);
	const [contextMenuVisible, setContextMenuVisible] = useState(false);

	const handleOpenContextMenu = (participant: Participant) => {
		setSelectedParticipant(participant);
		setContextMenuVisible(true);
	};

	const handleCloseContextMenu = () => {
		setContextMenuVisible(false);
		setSelectedParticipant(null);
	};

	const handleUnbanUser = async () => {
		const token = await auth.getToken();
		if (!token) {
			console.error("Failed to get token");
			return;
		}
		const roomData = JSON.parse(room as string);
		const response = await fetch(
			`${utils.API_BASE_URL}/rooms/${roomData.roomID}/banned`,
			{
				method: "DELETE",
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					userID: selectedParticipant?.id,
				}),
			},
		);
		if (!response.ok) {
			console.error("Failed to ban user");
			return;
		}
		console.log("User banned successfully");
		setBannedUsersarray(
			bannedUsersArray.filter(
				(user: Participant) => user.id !== selectedParticipant?.id,
			),
		);
		handleCloseContextMenu();
	};

	useEffect(() => {
		const getBannedUsers = async () => {
			// Fetch banned users from the server
			const token = await auth.getToken();
			if (!token) {
				console.error("Failed to get token");
				return;
			}
			const roomData = JSON.parse(room as string);
			const response = await fetch(
				`${utils.API_BASE_URL}/rooms/${roomData.roomID}/banned`,
				{
					method: "GET",
					headers: {
						Authorization: `Bearer ${token}`,
					},
				},
			);
			if (!response.ok) {
				console.error("Failed to fetch banned users");
				return;
			}
			const data = await response.json();
			console.log("Banned users:", data);
			setBannedUsersarray(
				data?.map((user: any): Participant => {
					return {
						id: user.userID,
						username: user.username,
						profilePictureUrl: user.profile_picture_url,
					};
				}),
			);
		};
		getBannedUsers();
	}, []);

	const renderItem = ({ item }: { item: Participant }) => {
		const truncatedUsername =
			item.username.length > 20
				? `${item.username.slice(0, 17)}...`
				: item.username;

		return (
			<View style={styles.participantContainer}>
				<TouchableOpacity style={styles.profileInfoContainer}>
					<Image
						source={
							item.profilePictureUrl
								? { uri: item.profilePictureUrl }
								: require("../../assets/profile-icon.png")
						}
						style={styles.profilePicture}
					/>
					<Text style={styles.username}>{truncatedUsername}</Text>
				</TouchableOpacity>
				{/* <TouchableOpacity onPress={() => handleOpenContextMenu(item)}>
					<Ionicons name="ellipsis-vertical" size={24} color="black" />
				</TouchableOpacity> */}
				<TouchableOpacity onPress={() => handleOpenContextMenu(item)}>
					<Ionicons
						name="ellipsis-vertical"
						size={24}
						color="black"
						testID={`ellipsis-${item.id}`}
					/>
				</TouchableOpacity>
			</View>
		);
	};

	return (
		<View style={styles.container}>
			<View style={styles.headerContainer}>
				<TouchableOpacity
					style={styles.backButton}
					onPress={() => navigation.goBack()}
					testID="back-button"
				>
					<Ionicons name="chevron-back" size={24} color="black" />
				</TouchableOpacity>
				<Text style={styles.header}>Banned Users</Text>
			</View>

			{bannedUsersArray.length === 0 ? (
				<View style={styles.emptyQueueContainer}>
					<Text style={styles.emptyQueueText}>
						This room has no banned users.
					</Text>
				</View>
			) : (
				<FlatList
					data={bannedUsersArray}
					renderItem={renderItem}
					keyExtractor={(item) => item.id}
				/>
			)}

			{/* Context Menu for Unban User */}
			<Modal
				visible={contextMenuVisible}
				transparent={true}
				animationType="slide"
				onRequestClose={handleCloseContextMenu}
			>
				<View style={styles.overlay}>
					<View style={styles.modalView}>
						<Text style={styles.modalTextHeader}>
							Unban {selectedParticipant?.username}?
						</Text>
						<View style={styles.buttonContainer}>
							<TouchableOpacity
								style={[styles.buttonModal, styles.unbanButton]}
								onPress={handleUnbanUser}
							>
								<Text style={styles.buttonText}>Unban User</Text>
							</TouchableOpacity>
							<TouchableOpacity
								style={[styles.buttonModal, styles.cancelButton]}
								onPress={handleCloseContextMenu}
							>
								<Text style={styles.buttonText}>Cancel</Text>
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</Modal>
		</View>
	);
};

// Styles remain unchanged...

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "white",
		padding: 16,
	},
	emptyQueueContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: 20,
	},
	emptyQueueText: {
		fontSize: 18,
		textAlign: "center",
		color: "#888",
	},
	headerContainer: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		marginBottom: 16,
	},
	backButton: {
		position: "absolute",
		left: 10,
	},
	header: {
		fontSize: 24,
		fontWeight: "bold",
		color: "black",
	},
	participantContainer: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		marginVertical: 8,
		padding: 10,
	},
	profileInfoContainer: {
		flexDirection: "row",
		alignItems: "center",
	},
	profilePicture: {
		width: 50,
		height: 50,
		borderRadius: 25,
		marginRight: 10,
	},
	username: {
		flex: 1,
		fontSize: 16,
		color: "black",
	},
	// Modal styles
	overlay: {
		flex: 1,
		justifyContent: "flex-end",
		backgroundColor: "rgba(0, 0, 0, 0.5)",
	},
	modalView: {
		width: "100%",
		height: "18%",
		backgroundColor: "white",
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
		padding: 20,
		paddingBottom: 40,
		alignItems: "center",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 4,
		elevation: 5,
	},
	modalTextHeader: {
		fontSize: 19,
		textAlign: "center",
		fontWeight: "bold",
	},
	buttonContainer: {
		marginTop: 30,
		flexDirection: "row",
		justifyContent: "space-between", // Align buttons side by side
		width: "100%", // Full width
	},
	buttonModal: {
		borderRadius: 5,
		padding: 10,
		elevation: 2,
		width: "48%", // Make buttons take up about half the width
		alignItems: "center",
	},
	unbanButton: {
		backgroundColor: colors.primary,
		borderRadius: 25,
	},
	cancelButton: {
		backgroundColor: colors.secondary,
		borderRadius: 25,
	},
	buttonText: {
		color: "white",
		fontWeight: "bold",
		textAlign: "center",
		fontSize: 16,
	},
});

export default BannedUsers;
