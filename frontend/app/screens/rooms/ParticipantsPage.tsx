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
import { useLive } from "../../LiveContext";
import { UserDto } from "../../../api";

const ParticipantsPage: React.FC = () => {
	const navigation = useNavigation();
	const { roomParticipants } = useLive();

	const navigateToProfile = (userId: string) => {};

	const renderItem = ({ item }: { item: UserDto }) => (
		<TouchableOpacity style={styles.participantContainer}>
			<Image
				source={{ uri: item.profile_picture_url }}
				style={styles.profilePicture}
			/>
			<Text style={styles.username}>{item.username}</Text>
		</TouchableOpacity>
	);

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
			{(roomParticipants.length === 0 && (
				<View style={styles.emptyQueueContainer}>
					<Text style={styles.emptyQueueText}>
						This room has no participants.{" "}
						{/* {isMine = true
							? "Add some songs to get started!"
							: "Wait for the host to add some songs."} */}
					</Text>
				</View>
			)) || (
				<FlatList
					data={roomParticipants}
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
