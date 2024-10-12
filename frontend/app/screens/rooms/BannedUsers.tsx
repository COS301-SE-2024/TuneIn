import React, { useState } from "react";
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

interface Participant {
	id: string;
	username: string;
	profilePictureUrl: string;
}

const BannedUsers: React.FC = () => {
	const navigation = useNavigation();
	const [selectedParticipant, setSelectedParticipant] =
		useState<Participant | null>(null);
	const [contextMenuVisible, setContextMenuVisible] = useState(false);

	// Mock Data for Banned Participants
	const mockParticipants: Participant[] = [
		{
			id: "1",
			username: "john_doe_123",
			profilePictureUrl: "https://randomuser.me/api/portraits/men/1.jpg",
		},
		{
			id: "2",
			username: "jane_smith_456",
			profilePictureUrl: "https://randomuser.me/api/portraits/women/2.jpg",
		},
		{
			id: "3",
			username: "sam_wilson_789",
			profilePictureUrl: "https://randomuser.me/api/portraits/men/3.jpg",
		},
	];

	const handleOpenContextMenu = (participant: Participant) => {
		setSelectedParticipant(participant);
		setContextMenuVisible(true);
	};

	const handleCloseContextMenu = () => {
		setContextMenuVisible(false);
		setSelectedParticipant(null);
	};

	const handleUnbanUser = () => {
		// Perform the unban action here
		console.log(`Unbanning user: ${selectedParticipant?.username}`);
		// After unbanning, close the menu
		handleCloseContextMenu();
	};

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
				<TouchableOpacity onPress={() => handleOpenContextMenu(item)}>
					<Ionicons name="ellipsis-vertical" size={24} color="black" />
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

			{mockParticipants.length === 0 ? (
				<View style={styles.emptyQueueContainer}>
					<Text style={styles.emptyQueueText}>
						This room has no banned users.
					</Text>
				</View>
			) : (
				<FlatList
					data={mockParticipants}
					renderItem={renderItem}
					keyExtractor={(item) => item.id}
				/>
			)}

			{/* Context Menu for Unban User */}
			<Modal
				visible={contextMenuVisible}
				transparent={true}
				animationType="fade"
				onRequestClose={handleCloseContextMenu}
			>
				<View style={styles.modalOverlay}>
					<View style={styles.modalContainer}>
						<Text style={styles.modalTitle}>
							Unban {selectedParticipant?.username}?
						</Text>
						<TouchableOpacity
							style={styles.modalButton}
							onPress={handleUnbanUser}
						>
							<Text style={styles.modalButtonText}>Unban User</Text>
						</TouchableOpacity>
						<TouchableOpacity
							style={styles.modalCancelButton}
							onPress={handleCloseContextMenu}
						>
							<Text style={styles.modalCancelButtonText}>Cancel</Text>
						</TouchableOpacity>
					</View>
				</View>
			</Modal>
		</View>
	);
};

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
	modalOverlay: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "rgba(0, 0, 0, 0.5)",
	},
	modalContainer: {
		width: 300,
		padding: 20,
		backgroundColor: "white",
		borderRadius: 10,
		alignItems: "center",
	},
	modalTitle: {
		fontSize: 18,
		fontWeight: "bold",
		marginBottom: 20,
	},
	modalButton: {
		width: "85%",
		padding: 10,
		alignItems: "center",
		marginBottom: 10,
		backgroundColor: colors.primary,
		borderRadius: 25,
	},
	modalButtonText: {
		color: "white",
		fontSize: 16,
		fontWeight: "bold",
	},
	modalCancelButton: {
		width: "85%",
		padding: 10,
		alignItems: "center",
		backgroundColor: colors.secondary,
		borderRadius: 25,
	},
	modalCancelButtonText: {
		color: "white",
		fontSize: 16,
		fontWeight: "bold",
	},
});

export default BannedUsers;
