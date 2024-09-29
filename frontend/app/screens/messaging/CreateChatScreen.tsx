import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	FlatList,
	TextInput,
	StyleSheet,
	TouchableOpacity,
	Image,
} from "react-native";
import { Ionicons, Octicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import FriendServices from "../../services/FriendServices"; // Import FriendServices
import { Friend } from "../../models/friend"; // Adjust import path as necessary

interface CreateChatScreenProps {
	closeModal: () => void;
}

const CreateChatScreen: React.FC<CreateChatScreenProps> = ({ closeModal }) => {
	const [searchQuery, setSearchQuery] = useState<string>("");
	const [allUsers, setAllUsers] = useState<Friend[]>([]); // Combined list of friends and followers
	const [filteredUsers, setFilteredUsers] = useState<Friend[]>([]);
	const router = useRouter();

	// Fetch friends and followers when the component mounts
	useEffect(() => {
		const fetchUsers = async () => {
			try {
				const friends = await FriendServices.getFriends();
				const followers = await FriendServices.fetchFollowers();
				// Combine friends and followers, ensuring friends come first
				setAllUsers([...friends, ...followers]);
			} catch (error) {
				console.error("Error fetching users:", error);
			}
		};

		fetchUsers();
	}, []);

	const handleSearch = (query: string) => {
		setSearchQuery(query);
		const filtered = allUsers.filter((user) =>
			user.username.toLowerCase().includes(query.toLowerCase()),
		);
		setFilteredUsers(filtered);
	};

	const handleUserSelect = (user: Friend) => {
		router.navigate(`/screens/messaging/ChatScreen?username=${user.username}`);
		closeModal();
	};

	return (
		<View style={styles.screenContainer}>
			<View style={styles.headerContainer}>
				<Text style={styles.headerText}>New Chat</Text>
				<TouchableOpacity
					onPress={closeModal}
					style={styles.closeButton}
					testID="close-button"
				>
					<Octicons name="x" size={24} color="black" />
				</TouchableOpacity>
			</View>
			<View style={styles.searchContainer}>
				<Ionicons name="search" size={24} color="black" />
				<TextInput
					style={styles.searchInput}
					placeholder="Search for a user..."
					value={searchQuery}
					onChangeText={handleSearch}
					selectionColor="#CCCCCC"
				/>
			</View>
			<FlatList
				data={filteredUsers.length > 0 ? filteredUsers : allUsers} // Use filtered users or all users
				keyExtractor={(item) => item.friend_id} // Changed to friend_id
				renderItem={({ item }) => (
					<TouchableOpacity
						style={styles.userItem}
						onPress={() => handleUserSelect(item)}
					>
						<Image
							source={{ uri: item.profile_picture_url }}
							style={styles.avatar}
						/>
						<View>
							<Text style={styles.name}>{item.username}</Text>
							{/* Assuming username is available */}
							<Text style={styles.username}>{item.username}</Text>
						</View>
					</TouchableOpacity>
				)}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	screenContainer: {
		flex: 1,
		backgroundColor: "white",
		paddingHorizontal: 20,
		paddingTop: 20,
	},
	headerContainer: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 10,
		justifyContent: "center",
	},
	headerText: {
		fontSize: 24,
		fontWeight: "bold",
		textAlign: "center",
		flex: 1,
	},
	searchContainer: {
		flexDirection: "row",
		alignItems: "center",
		borderColor: "#CCCCCC",
		borderWidth: 1,
		borderRadius: 20,
		paddingHorizontal: 16,
		marginBottom: 20,
		marginTop: 10,
	},
	searchInput: {
		flex: 1,
		height: 40,
		paddingVertical: 0,
		marginLeft: 10,
		borderWidth: 0,
	},
	userItem: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 10,
		borderBottomWidth: 1,
		borderBottomColor: "#CCCCCC",
	},
	avatar: {
		width: 40,
		height: 40,
		borderRadius: 20,
		marginRight: 10,
	},
	name: {
		fontSize: 16,
		fontWeight: "bold",
	},
	username: {
		fontSize: 14,
		color: "gray",
	},
	closeButton: {
		position: "absolute",
		right: 0,
	},
	closeButtonText: {
		color: "white",
		fontSize: 16,
		fontWeight: "bold",
	},
});

export default CreateChatScreen;
