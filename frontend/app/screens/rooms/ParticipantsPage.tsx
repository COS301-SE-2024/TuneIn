import React from "react";
import {
	View,
	Text,
	Image,
	StyleSheet,
	TouchableOpacity,
	FlatList,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";

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

	const renderItem = ({ item }: { item: Participant }) => {
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
						item.profilePictureUrl
							? { uri: item.profilePictureUrl }
							: require("../../assets/profile-icon.png")
					}
					style={styles.profilePicture}
				/>
				<Text style={styles.username}>{truncatedUsername}</Text>
				{/* Apply truncated username */}
			</TouchableOpacity>
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
