import React, { useCallback, useEffect, useState } from "react";
import {
	View,
	Text,
	Image,
	StyleSheet,
	TouchableOpacity,
	FlatList,
	Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useLive } from "../../LiveContext";
import { UserDto } from "../../../api";
import { useAPI } from "../../APIContext";
import { colors } from "../../styles/colors"; // Assuming colors file is available

interface Participant {
	id: string;
	username: string;
	profilePictureUrl: string;
}

interface ParticipantsPageProps {
	participants: Participant[];
}

const ParticipantsPage: React.FC = () => {
	const router = useRouter();
	const [selectedParticipant, setSelectedParticipant] =
		useState<Participant | null>(null);
	const [contextMenuVisible, setContextMenuVisible] = useState(false);

	const { roomID } = useLocalSearchParams<{ roomID: string }>();
	const { rooms } = useAPI();
	const { currentRoom, roomParticipants } = useLive();
	const [participants, setParticipants] = React.useState<UserDto[]>([]);

	const handleOpenContextMenu = (participant: Participant) => {
		setSelectedParticipant(participant);
		setContextMenuVisible(true);
	};

	const handleCloseContextMenu = () => {
		setContextMenuVisible(false);
		setSelectedParticipant(null);
	};

	const handleBanUser = () => {
		console.log(`Banning user: ${selectedParticipant?.username}`);
		handleCloseContextMenu();
	};

	const truncateUsername = (username: string) => {
		return username.length > 20 ? `${username.slice(0, 17)}...` : username;
	};

	const renderItem = ({ item }: { item: UserDto }) => {
		// Truncate the username if it's longer than 20 characters
		const truncatedUsername =
			item.username.length > 20
				? `${item.username.slice(0, 17)}...`
				: item.username;

		const participant: Participant = {
			id: item.userID, // Assuming userID maps to id
			username: item.username,
			profilePictureUrl: item.profile_picture_url || "", // Fallback if profile_picture_url is missing
		};

		return (
			<View style={styles.participantContainer}>
				<TouchableOpacity style={styles.profileInfoContainer}>
					<Image
						source={
							participant.profilePictureUrl
								? { uri: participant.profilePictureUrl }
								: require("../../assets/profile-icon.png")
						}
						style={styles.profilePicture}
					/>
					<Text style={styles.username}>{truncatedUsername}</Text>
				</TouchableOpacity>

				<TouchableOpacity
					onPress={() => handleOpenContextMenu(participant)}
					testID={`ellipsis-button-${participant.id}`}
				>
					<Ionicons name="ellipsis-vertical" size={24} color="black" />
				</TouchableOpacity>
			</View>
		);
	};

	const fetchRoomParticipants = useCallback(async (): Promise<UserDto[]> => {
		const usersResponse = await rooms.getRoomUsers(roomID);
		return usersResponse.data;
	}, [roomID, rooms]);

	// on roomID or currentRoom change
	useEffect(() => {
		if (currentRoom) {
			setParticipants(roomParticipants);
		} else {
			fetchRoomParticipants().then((users) => {
				setParticipants(users);
			});
		}
	}, [currentRoom, roomParticipants]);

	// on mount
	useEffect(() => {
		if (currentRoom) {
			setParticipants(roomParticipants);
		} else {
			fetchRoomParticipants().then((users) => {
				setParticipants(users);
			});
		}
	}, []);

	return (
		<View style={styles.container}>
			<View style={styles.headerContainer}>
				<TouchableOpacity
					style={styles.backButton}
					onPress={() => router.back()}
					testID="back-button"
				>
					<Ionicons name="chevron-back" size={24} color="black" />
				</TouchableOpacity>
				<Text style={styles.header}>Participants</Text>
			</View>
			{(participants.length === 0 && (
				<View style={styles.emptyQueueContainer}>
					<Text style={styles.emptyQueueText}>
						This room has no participants.
					</Text>
				</View>
			)) || (
				<FlatList
					data={participants}
					renderItem={renderItem}
					keyExtractor={(item) => item.userID}
				/>
			)}

			<Modal
				animationType="slide"
				transparent={true}
				visible={contextMenuVisible}
				onRequestClose={handleCloseContextMenu}
			>
				<View style={styles.overlay}>
					<View style={styles.modalView}>
						<Text style={styles.modalTextHeader}>
							Ban {truncateUsername(selectedParticipant?.username || "")}?
						</Text>
						<View style={styles.buttonContainer}>
							<TouchableOpacity
								style={[styles.buttonModal, styles.banButton]}
								onPress={handleBanUser}
							>
								<Text style={styles.buttonText}>Ban User</Text>
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
		marginBottom: 0,
		textAlign: "center",
		fontWeight: "bold",
	},
	buttonContainer: {
		marginTop: 30,
		flexDirection: "row",
		justifyContent: "space-between", // Align buttons side by side
		width: "100%", // Make sure it occupies the full width
	},
	buttonModal: {
		borderRadius: 5,
		padding: 10,
		elevation: 2,
		width: "48%", // Make buttons take up about half the width
		alignItems: "center",
	},
	banButton: {
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

export default ParticipantsPage;
