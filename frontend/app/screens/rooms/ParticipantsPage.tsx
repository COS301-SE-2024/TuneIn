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

	const navigateToProfile = (userId: string) => {
		// Replace with actual navigation logic
		console.log(`Navigating to profile of user with ID: ${userId}`);
		// For example: navigation.navigate('UserProfile', { userId });
	};

	const renderItem = ({ item }: { item: Participant }) => (
		<TouchableOpacity
			style={styles.participantContainer}
			onPress={() => navigateToProfile(item.id)}
		>
			<Image
				source={{ uri: item.profilePictureUrl }}
				style={styles.profilePicture}
			/>
			<Text style={styles.username}>{item.username}</Text>
		</TouchableOpacity>
	);

	const mockData: Participant[] = [
		// Added more participants for scrolling
		{
			id: "1",
			username: "JohnDoe",
			profilePictureUrl: "https://f4.bcbits.com/img/a3392505354_10.jpg",
		},
		{
			id: "2",
			username: "JaneSmith",
			profilePictureUrl: "https://f4.bcbits.com/img/a3392505354_10.jpg",
		},
		{
			id: "3",
			username: "AliceJohnson",
			profilePictureUrl: "https://f4.bcbits.com/img/a3392505354_10.jpg",
		},
		{
			id: "4",
			username: "BobBrown",
			profilePictureUrl: "https://f4.bcbits.com/img/a3392505354_10.jpg",
		},
		{
			id: "5",
			username: "EmilyDavis",
			profilePictureUrl: "https://f4.bcbits.com/img/a3392505354_10.jpg",
		},
		{
			id: "6",
			username: "MichaelWilson",
			profilePictureUrl: "https://f4.bcbits.com/img/a3392505354_10.jpg",
		},
		{
			id: "7",
			username: "OliviaGarcia",
			profilePictureUrl: "https://f4.bcbits.com/img/a3392505354_10.jpg",
		},
		{
			id: "8",
			username: "DavidMiller",
			profilePictureUrl: "https://f4.bcbits.com/img/a3392505354_10.jpg",
		},
		{
			id: "9",
			username: "DavidMiller",
			profilePictureUrl: "https://f4.bcbits.com/img/a3392505354_10.jpg",
		},
	];

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
			<FlatList
				data={mockData}
				renderItem={renderItem}
				keyExtractor={(item) => item.id}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "white",
		padding: 16,
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
