import React, { useCallback, useEffect } from "react";
import {
	View,
	Text,
	Image,
	StyleSheet,
	TouchableOpacity,
	FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useLive } from "../../LiveContext";
import { UserDto } from "../../../api";
import { useAPI } from "../../APIContext";

const ParticipantsPage: React.FC<ParticipantsPageProps> = ({
	participants,
}) => {
	const navigation = useRouter();
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

	const navigateToProfile = (user: any) => {
		console.log("Navigating to profile page for user:", user);
		navigation.navigate(
			`/screens/profile/ProfilePage?friend=${JSON.stringify({
				profile_picture_url: user.profile_picture_url,
				username: user.username,
			})}&user=${user}`,
		);
	};

	const renderItem = ({ item }: { item: UserDto }) => {
		// Truncate the username if it's longer than 20 characters
		const truncatedUsername =
			item.username.length > 20
				? `${item.username.slice(0, 17)}...`
				: item.username;

		return (
			<TouchableOpacity
				style={styles.participantContainer}
				onPress={navigateToProfile.bind(null, item)}
			>
				<Image
					source={
						item.profile_picture_url
							? { uri: item.profile_picture_url }
							: require("../../assets/profile-icon.png")
					}
					style={styles.profilePicture}
				/>
				<Text style={styles.username}>{truncatedUsername}</Text>
				{/* Apply truncated username */}
			</TouchableOpacity>
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
					onPress={() => navigation.back()}
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
		marginVertical: 8,
		padding: 10,
		borderBottomWidth: 0, // Removes the line under each participant
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
});

export default ParticipantsPage;
