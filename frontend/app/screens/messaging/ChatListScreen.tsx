import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	FlatList,
	TextInput,
	StyleSheet,
	TouchableOpacity,
} from "react-native";
import { Ionicons, Entypo } from "@expo/vector-icons";
import ChatItem, { ChatItemProps } from "../../components/ChatItem";
import { Chat } from "../../models/chat";
import { colors } from "../../styles/colors";
import CreateChatScreen from "./CreateChatScreen";
import Modal from "react-native-modal";
import { useRouter } from "expo-router";
import { DirectMessageDto } from "../../models/DmDto";
import auth from "../../services/AuthManagement";
import * as utils from "../../services/Utils";
import axios from "axios";
import { UserDto } from "../../models/UserDto";

const initialChats: Chat[] = [
	{
		id: "1",
		name: "John Doe",
		lastMessage: "Hey there!",
		avatar:
			"https://images.pexels.com/photos/3792581/pexels-photo-3792581.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
	},
	{
		id: "2",
		name: "Jane Smith",
		lastMessage: "What's up?",
		avatar:
			"https://images.pexels.com/photos/3792581/pexels-photo-3792581.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
	},
	// Add more dummy chats
];

const createChats = (
	messages: DirectMessageDto[],
	selfID: string,
): ChatItemProps[] => {
	const chats: ChatItemProps[] = [];
	for (const message of messages) {
		chats.push({
			message: message,
			otherUser:
				message.sender.userID === selfID ? message.recipient : message.sender,
		});
	}
	return chats;
};

const ChatListScreen = () => {
	const selfRef = React.useRef<UserDto>();
	const [searchQuery, setSearchQuery] = useState("");
	const [userMessages, setUserMessages] = useState<DirectMessageDto[]>([]);
	const [filteredChats, setFilteredChats] = useState<ChatItemProps[]>([]);
	const [friends, setFriends] = useState<UserDto[]>([]);
	const [isModalVisible, setModalVisible] = useState(false);
	const router = useRouter();

	useEffect(() => {
		// Fetch chats from backend
		(async () => {
			try {
				const token = await auth.getToken();

				const promises = [];
				promises.push(
					axios.get(`${utils.API_BASE_URL}/users/dms`, {
						headers: { Authorization: `Bearer ${token}` },
					}),
				);
				promises.push(
					axios.get(`${utils.API_BASE_URL}/users`, {
						headers: { Authorization: `Bearer ${token}` },
					}),
				);
				promises.push(
					axios.get(`${utils.API_BASE_URL}/users/friends`, {
						headers: { Authorization: `Bearer ${token}` },
					}),
				);

				const responses = await Promise.all(promises);
				const chats = responses[0].data as DirectMessageDto[];
				console.log(chats);
				selfRef.current = responses[1].data as UserDto;
				console.log(selfRef.current);
				setFriends(responses[2].data as UserDto[]);
				console.log(responses[2].data);

				setFilteredChats(createChats(chats, selfRef.current.userID));
				setUserMessages(chats);
			} catch (error) {
				console.error(error);
				throw error;
			}
		})();
	}, []);

	useEffect(() => {
		/*
		if (searchQuery === "") {
			setFilteredChats(initialChats);
		} else {
			const filtered = initialChats.filter((chat) =>
				chat.name.toLowerCase().includes(searchQuery.toLowerCase()),
			);
			setFilteredChats(filtered);
		}
			*/
		if (searchQuery === "") {
			if (selfRef.current !== undefined) {
				setFilteredChats(createChats(userMessages, selfRef.current.userID));
			}
		} else {
			if (selfRef.current !== undefined) {
				const filtered = userMessages.filter((chat) => {
					return chat.sender.profile_name
						.toLowerCase()
						.includes(searchQuery.toLowerCase());
				});

				setFilteredChats(createChats(filtered, selfRef.current.userID));
			}
		}
	}, [searchQuery]);

	const toggleModal = () => {
		setModalVisible(!isModalVisible);
	};

	return (
		<View style={styles.screenContainer}>
			<View style={styles.headerContainer}>
				<TouchableOpacity testID="back-button" onPress={() => router.back()}>
					<Ionicons name="chevron-back" size={24} color="black" />
				</TouchableOpacity>
				<Text style={styles.chatHeader}>Chats</Text>
			</View>
			<View style={styles.searchContainer}>
				<TextInput
					style={styles.searchInput}
					placeholder="Search for a user..."
					value={searchQuery}
					onChangeText={setSearchQuery}
				/>
				<TouchableOpacity style={styles.searchIconContainer} onPress={() => {}}>
					<Ionicons name="search" size={24} color="black" />
				</TouchableOpacity>
			</View>
			<FlatList
				data={filteredChats}
				keyExtractor={(item) => item.message.pID}
				renderItem={({ item }) => (
					<ChatItem message={item.message} otherUser={item.otherUser} />
				)}
			/>
			<TouchableOpacity style={styles.newChatButton} onPress={toggleModal}>
				<Entypo name="message" size={24} color="white" />
			</TouchableOpacity>
			<Modal
				isVisible={isModalVisible}
				onBackdropPress={toggleModal}
				onSwipeComplete={toggleModal}
				swipeDirection="down"
				style={styles.modal}
			>
				<CreateChatScreen closeModal={toggleModal} friends={friends} />
			</Modal>
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
		padding: 10,
	},
	chatHeader: {
		flex: 1,
		fontSize: 24,
		fontWeight: "bold",
		textAlign: "center",
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
	},
	searchIconContainer: {
		padding: 10,
	},
	newChatButton: {
		position: "absolute",
		right: 20,
		bottom: 20,
		width: 60,
		height: 60,
		borderRadius: 30,
		backgroundColor: colors.primary,
		alignItems: "center",
		justifyContent: "center",
	},
	modal: {
		justifyContent: "flex-end",
		margin: 0,
		height: "90%",
	},
});

export default ChatListScreen;
