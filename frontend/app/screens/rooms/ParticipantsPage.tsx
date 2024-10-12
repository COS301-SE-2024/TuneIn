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
import { useLocalSearchParams, useRouter } from "expo-router";
import { colors } from "../../styles/colors"; // Assuming colors file is available

interface Participant {
	id: string;
	username: string;
	profilePictureUrl: string;
}

interface ParticipantsPageProps {
	participants: Participant[];
}

const ParticipantsPage: React.FC<ParticipantsPageProps> = ({
	participants,
}) => {
	const navigation = useNavigation();
	const [selectedParticipant, setSelectedParticipant] =
		useState<Participant | null>(null);
	const [contextMenuVisible, setContextMenuVisible] = useState(false);

	let _roomParticipants = useLocalSearchParams();
	let roomParticipants = _roomParticipants.participants;
	const participantsInRoom: Participant[] = [];
	if (typeof roomParticipants === "string") {
		const roomParticipantsArray = JSON.parse(roomParticipants);
		roomParticipantsArray.forEach(
			(participant: {
				userID: string;
				username: string;
				profile_picture_url: string;
			}) => {
				participantsInRoom.push({
					id: participant.userID,
					username: participant.username,
					profilePictureUrl: participant.profile_picture_url,
				});
			},
		);
	} else if (Array.isArray(roomParticipants)) {
		roomParticipants.forEach((participant) => {
			participantsInRoom.push(JSON.parse(participant));
		});
	}

	const navigateToProfile = (userId: string) => {};

	const handleOpenContextMenu = (participant: Participant) => {
		setSelectedParticipant(participant);
		setContextMenuVisible(true);
	};

	const handleCloseContextMenu = () => {
		setContextMenuVisible(false);
		setSelectedParticipant(null);
	};

	const handleBanUser = () => {
		// Perform the ban action here
		console.log(`Banning user: ${selectedParticipant?.username}`);
		// After banning, close the menu
		handleCloseContextMenu();
	};

	const truncateUsername = (username: string) => {
		return username.length > 20 ? `${username.slice(0, 17)}...` : username;
	};

	const renderItem = ({ item }: { item: Participant }) => {
		// Truncate the username if it's longer than 20 characters
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

				{/* Add Menu Icon Button */}
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
				<Text style={styles.header}>Participants</Text>
			</View>
			{participantsInRoom.length === 0 ? (
				<View style={styles.emptyQueueContainer}>
					<Text style={styles.emptyQueueText}>
						This room has no participants.
					</Text>
				</View>
			) : (
				<FlatList
					data={participantsInRoom}
					renderItem={renderItem}
					keyExtractor={(item) => item.id}
				/>
			)}

			{/* Context Menu for Ban User */}
			<Modal
				visible={contextMenuVisible}
				transparent={true}
				animationType="fade"
				onRequestClose={handleCloseContextMenu}
			>
				<View style={styles.modalOverlay}>
					<View style={styles.modalContainer}>
						<Text style={styles.modalTitle}>
							Ban {truncateUsername(selectedParticipant?.username || "")}?
						</Text>
						<View style={styles.modalButtonsContainer}>
							<TouchableOpacity
								style={styles.modalButton}
								onPress={handleBanUser}
							>
								<Text style={styles.modalButtonText}>Ban User</Text>
							</TouchableOpacity>
							<TouchableOpacity
								style={styles.modalCancelButton}
								onPress={handleCloseContextMenu}
							>
								<Text style={styles.modalCancelButtonText}>Cancel</Text>
							</TouchableOpacity>
						</View>
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
		justifyContent: "space-between", // This ensures spacing between username and menu button
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
		textAlign: "center",
	},
	modalButtonsContainer: {
		width: 300,
		padding: 20,
		backgroundColor: "white",
		borderRadius: 10,
		alignItems: "center",
	},
	modalButton: {
		width: "100%",
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
		width: "100%",
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

export default ParticipantsPage;
