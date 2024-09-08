import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	Modal,
	Animated,
	StyleSheet,
	Easing,
	TextInput,
	FlatList,
	TouchableOpacity,
} from "react-native";
import { colors } from "../../styles/colors";
import { DirectMessageDto } from "../../models/DmDto"; // Assuming this contains the data model
import { Room } from "../../models/Room"; // Assuming this contains the data model
import ProfileCard, {
	ProfileCardProps,
} from "../../components/messaging/profileCard"; // ProfileCard component for displaying users
import auth from "../../services/AuthManagement"; // For fetching auth token
import axios from "axios";
import * as utils from "../../services/Utils"; // For API_BASE_URL
import { UserDto } from "../../models/UserDto";

interface RoomShareSheetProps {
	room: Room;
	isVisible: boolean;
	onClose: () => void;
}

const createChats = (
	messages: DirectMessageDto[],
	selfID: string | undefined,
): ProfileCardProps[] => {
	const chats: ProfileCardProps[] = [];
	for (const message of messages) {
		chats.push({
			otherUser:
				message.sender.userID === selfID ? message.recipient : message.sender,
			isSelected: false, // Initialize as not selected
			select: () => {}, // Placeholder for select function
		});
	}
	return chats;
};

const RoomShareSheet: React.FC<RoomShareSheetProps> = ({
	room,
	isVisible,
	onClose,
}) => {
	const [slideAnim] = useState(new Animated.Value(300)); // Initial position of the popup
	const [searchQuery, setSearchQuery] = useState(""); // Search query state
	const [userMessages, setUserMessages] = useState<DirectMessageDto[]>([]); // Messages state
	const [filteredChats, setFilteredChats] = useState<ProfileCardProps[]>([]); // Filtered chat state
	const [selectedUsers, setSelectedUsers] = useState<UserDto[]>([]); // Selected chats state
	const selfRef = React.useRef<UserDto | null>(null); // Explicitly define type and initialize with null

	useEffect(() => {
		if (isVisible) {
			Animated.timing(slideAnim, {
				toValue: 0, // Move up from the bottom
				duration: 300,
				easing: Easing.ease,
				useNativeDriver: true,
			}).start();
		} else {
			Animated.timing(slideAnim, {
				toValue: 300, // Move down to the bottom
				duration: 300,
				easing: Easing.ease,
				useNativeDriver: true,
			}).start();
		}
	}, [isVisible, slideAnim]);

	useEffect(() => {
		(async () => {
			try {
				const token = await auth.getToken();

				const responses = await Promise.all([
					axios.get(`${utils.API_BASE_URL}/users/dms`, {
						headers: { Authorization: `Bearer ${token}` },
					}),
					axios.get(`${utils.API_BASE_URL}/users`, {
						headers: { Authorization: `Bearer ${token}` },
					}),
				]);

				const chats = responses[0].data as DirectMessageDto[];
				selfRef.current = responses[1].data;

				setUserMessages(chats);
			} catch (error) {
				console.error(error);
			}
		})();
	}, []);

	useEffect(() => {
		const filtered =
			searchQuery === ""
				? userMessages
				: userMessages.filter(
						(chat) =>
							(chat.sender.profile_name || "")
								.toLowerCase()
								.includes(searchQuery.toLowerCase()) ||
							(chat.recipient.profile_name || "")
								.toLowerCase()
								.includes(searchQuery.toLowerCase()),
					);
		console.log("Search searchQuery:", searchQuery); // Log search results
		console.log("Search Results:", filtered); // Log search results

		if (selfRef.current !== undefined) {
			setFilteredChats(createChats(filtered, selfRef.current?.userID));
		}
	}, [searchQuery, userMessages]);

	const handleSelectChat = (user: UserDto) => {
		setSelectedUsers((prevSelected) =>
			prevSelected.includes(user)
				? prevSelected.filter((c) => c !== user)
				: [...prevSelected, user],
		);
	};

	const handleShare = (room: Room) => {
		console.log("Sharing with selected contacts:");
		selectedUsers.forEach((user) => {
			console.log(user.profile_name); // Print the name of each selected user
		});
		console.log("Room:", room.name);
		// Add your share functionality here

		// Clear selected users after sharing
		setSelectedUsers([]);
		onClose(); // Close the modal after sharing
	};

	const updateChatSelection = (user: UserDto) => {
		handleSelectChat(user);
	};

	const handleClose = () => {
		// Clear selected users when closing the modal
		setSelectedUsers([]);
		onClose(); // Call the original onClose function
	};

	return (
		<Modal
			testID="modal"
			transparent={true}
			animationType="none"
			visible={isVisible}
			onRequestClose={handleClose}
		>
			<View style={styles.modalOverlay}>
				<Animated.View
					style={[
						styles.popupContainer,
						{
							transform: [{ translateY: slideAnim }],
						},
					]}
				>
					<TextInput
						style={styles.searchInput}
						placeholder="Search for contacts..."
						value={searchQuery}
						onChangeText={setSearchQuery}
					/>
					<FlatList
						data={filteredChats}
						keyExtractor={(item) => item.otherUser.userID}
						renderItem={({ item }) => (
							<ProfileCard
								otherUser={item.otherUser}
								isSelected={selectedUsers.some(
									(u) => u.userID === item.otherUser.userID,
								)} // Check if the user is selected
								select={() => updateChatSelection(item.otherUser)} // Pass the select function
							/>
						)}
					/>
					<TouchableOpacity
						style={[
							styles.shareButton,
							{
								backgroundColor:
									selectedUsers.length > 0 ? colors.primary : "#CCCCCC",
							},
						]}
						onPress={() => {
							if (selectedUsers.length > 0) {
								handleShare(room);
							}
						}} // Use arrow function to wrap the call
					>
						<Text
							style={[
								styles.shareButtonText,
								{ color: selectedUsers.length > 0 ? "white" : "#666666" }, // Change text color based on selection
							]}
						>
							Share
						</Text>
					</TouchableOpacity>
				</Animated.View>
			</View>
		</Modal>
	);
};

const styles = StyleSheet.create({
	modalOverlay: {
		flex: 1,
		justifyContent: "flex-end",
		backgroundColor: "rgba(0, 0, 0, 0.5)",
	},
	popupContainer: {
		backgroundColor: colors.backgroundColor,
		padding: 30,
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 4,
		elevation: 5,
	},
	searchInput: {
		height: 40,
		borderColor: "#CCCCCC",
		borderWidth: 1,
		borderRadius: 20,
		paddingHorizontal: 16,
		marginBottom: 20,
	},
	shareButton: {
		paddingVertical: 15,
		borderRadius: 25,
		marginTop: 20,
		alignItems: "center",
	},
	shareButtonText: {
		fontWeight: "bold",
	},
});

export default RoomShareSheet;
