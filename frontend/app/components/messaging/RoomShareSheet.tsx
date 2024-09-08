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
import ProfileCard, {
	ProfileCardProps,
} from "../../components/messaging/profileCard"; // ProfileCard component for displaying users
import auth from "../../services/AuthManagement"; // For fetching auth token
import axios from "axios";
import * as utils from "../../services/Utils"; // For API_BASE_URL
import { UserDto } from "../../models/UserDto";

interface RoomShareSheetProps {
	isVisible: boolean;
	onClose: () => void;
	onConfirm: (choice: true | false) => Promise<void>; // Updated to take a choice
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
	isVisible,
	onClose,
	onConfirm,
}) => {
	const [slideAnim] = useState(new Animated.Value(300)); // Initial position of the popup
	const [searchQuery, setSearchQuery] = useState(""); // Search query state
	const [userMessages, setUserMessages] = useState<DirectMessageDto[]>([]); // Messages state
	const [filteredChats, setFilteredChats] = useState<ProfileCardProps[]>([]); // Filtered chat state
	const [selectedChats, setSelectedChats] = useState<UserDto[]>([]); // Selected chats state
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

				const initialChats = createChats(chats, selfRef.current?.userID);
				setFilteredChats(initialChats);
				setUserMessages(chats);
			} catch (error) {
				console.error(error);
			}
		})();
	}, []);

	useEffect(() => {
		if (searchQuery === "") {
			if (selfRef.current !== undefined) {
				setFilteredChats(createChats(userMessages, selfRef.current?.userID));
			}
		} else {
			if (selfRef.current !== undefined) {
				const filtered = userMessages.filter((chat) => {
					return chat.sender.profile_name
						.toLowerCase()
						.includes(searchQuery.toLowerCase());
				});

				setFilteredChats(createChats(filtered, selfRef.current?.userID));
			}
		}
	}, [searchQuery, userMessages]);

	const handleSelectChat = (user: UserDto) => {
		setSelectedChats((prevSelected) =>
			prevSelected.includes(user)
				? prevSelected.filter((c) => c !== user)
				: [...prevSelected, user],
		);
	};

	const handleShare = () => {
		console.log("Sharing with selected contacts:", selectedChats);
		// Add your share functionality here
		onClose(); // Close the modal after sharing
	};

	const updateChatSelection = (user: UserDto) => {
		handleSelectChat(user);
	};

	return (
		<Modal
			testID="modal"
			transparent={true}
			animationType="none"
			visible={isVisible}
			onRequestClose={onClose}
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
								isSelected={selectedChats.includes(item.otherUser)}
								select={() => updateChatSelection(item.otherUser)} // Pass the select function
							/>
						)}
					/>
					<TouchableOpacity style={styles.shareButton} onPress={handleShare}>
						<Text style={styles.shareButtonText}>Share</Text>
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
		backgroundColor: colors.primary,
		paddingVertical: 15,
		borderRadius: 25,
		marginTop: 20,
		alignItems: "center",
	},
	shareButtonText: {
		color: "white",
		fontWeight: "bold",
	},
});

export default RoomShareSheet;
