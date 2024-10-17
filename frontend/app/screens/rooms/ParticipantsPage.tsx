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
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { colors } from "../../styles/colors";
import * as utils from "../../services/Utils";
import auth from "../../services/AuthManagement";
import { Room } from "../../models/Room";
import { useLive } from "../../LiveContext";

interface Participant {
	id: string;
	username: string;
	profilePictureUrl: string;
}

interface ParticipantsPageProps {
	participants: Participant[];
} // Assuming colors file is available

interface Participant {
	id: string;
	username: string;
	profilePictureUrl: string;
}

interface ParticipantsPageProps {
	setParticipants?: (participants: Participant[]) => void;
}

const ParticipantsPage: React.FC<ParticipantsPageProps> = () => {
	const navigation = useRouter();
	const { currentUser } = useLive();
	if (currentUser === undefined) {
		throw new Error("currentUser is undefined");
	}
	console.log("currentUser", currentUser);
	const [selectedParticipant, setSelectedParticipant] =
		useState<Participant | null>(null);
	const [contextMenuVisible, setContextMenuVisible] = useState(false);
	const { participantsFr, room, setParticipants } = useLocalSearchParams();
	console.log("setParticipants", setParticipants);
	const roomData: Room = JSON.parse(room as string);
	console.log(
		"participantsFr",
		JSON.parse(participantsFr as string),
		"roomID",
		roomData.mine,
	);
	// let roomParticipants: Participant[] = JSON.parse(participantsFr as string);
	const [participantsInRoom, setParticipantsInRoom] = useState<Participant[]>(
		JSON.parse(participantsFr as string).map((participant: any) => {
			return {
				id: participant.userID,
				username: participant.username,
				profilePictureUrl: participant.profile_picture_url,
			};
		}),
	);

	const handleOpenContextMenu = (participant: Participant) => {
		setSelectedParticipant(participant);
		setContextMenuVisible(true);
	};

	const handleCloseContextMenu = () => {
		setContextMenuVisible(false);
		setSelectedParticipant(null);
	};

	const handleBanUser = async () => {
		console.log(`Banning user: ${selectedParticipant?.username}`);
		const token = await auth.getToken();
		if (!token) {
			console.error("Failed to get token");
			return;
		}
		const response = await fetch(
			`${utils.API_BASE_URL}/rooms/${roomData.roomID}/banned`,
			{
				method: "POST",
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
		setParticipantsInRoom(
			participantsInRoom.filter((participant) => {
				return participant.id !== selectedParticipant?.id;
			}),
		);
		handleCloseContextMenu();
	};

	const truncateUsername = (username: string) => {
		return username.length > 20 ? `${username.slice(0, 17)}...` : username;
	};

	const navigateToProfile = (user: any) => {
		console.log("Navigating to profile page for user:", user);
		navigation.navigate(
			`/screens/profile/ProfilePage?friend=${JSON.stringify({
				profile_picture_url: user.profile_picture_url,
				username: user.username,
			})}&user=${user}`,
		);
	};
	const renderItem = ({ item }: { item: Participant }) => {
		// Truncate the username if it's longer than 20 characters
		const showMenu: boolean = currentUser.userID !== item.id && roomData.mine;
		const truncatedUsername =
			item.username.length > 20
				? `${item.username.slice(0, 17)}...`
				: item.username;

		const participant: Participant = {
			id: item.id, // Assuming userID maps to id
			username: item.username,
			profilePictureUrl: item.profilePictureUrl || "", // Fallback if profile_picture_url is missing
		};

		return (
			<View style={styles.participantContainer}>
				<TouchableOpacity
					style={styles.profileInfoContainer}
					onPress={navigateToProfile.bind(null, item)}
				>
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
				{showMenu && (
					<TouchableOpacity
						onPress={() => handleOpenContextMenu(participant)}
						testID={`ellipsis-button-${participant.id}`}
					>
						<Ionicons name="ellipsis-vertical" size={24} color="black" />
					</TouchableOpacity>
				)}
			</View>
		);
	};

	return (
		<View style={styles.container}>
			<View style={styles.headerContainer}>
				<TouchableOpacity
					style={styles.backButton}
					onPress={() => navigation.back()}
					testID="back-button"
				>
					<Ionicons name="chevron-back" size={24} color="black" />
				</TouchableOpacity>
				<Text style={styles.header}>Participants</Text>
			</View>
			{(participantsInRoom.length === 0 && (
				<View style={styles.emptyQueueContainer}>
					<Text style={styles.emptyQueueText}>
						This room has no participants.
					</Text>
				</View>
			)) || (
				<FlatList
					data={participantsInRoom}
					renderItem={renderItem}
					keyExtractor={(item) => item.id}
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
