import React, { useState, useEffect, useCallback } from "react";
import {
	View,
	Text,
	FlatList,
	TextInput,
	StyleSheet,
	TouchableOpacity,
	ToastAndroid,
} from "react-native";
import { Ionicons, Entypo } from "@expo/vector-icons";
import ChatItem, { ChatItemProps } from "../../components/ChatItem";
import { colors } from "../../styles/colors";
import CreateChatScreen from "./CreateChatScreen";
import Modal from "react-native-modal";
import { useRouter } from "expo-router";
import auth from "../../services/AuthManagement";
import * as utils from "../../services/Utils";
import axios, { AxiosResponse } from "axios";
import { DirectMessageDto, UserDto, RoomDto } from "../../../api";
import { useLive } from "../../LiveContext";
import { useAPI } from "../../APIContext";
import { useIsFocused } from "@react-navigation/native";

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
	const { currentUser, refreshUser, setRefreshUser } = useLive();
	const { rooms } = useAPI();
	const [searchQuery, setSearchQuery] = useState("");
	const [userMessages, setUserMessages] = useState<DirectMessageDto[]>([]);
	const [messageRooms, setMessageRooms] = useState<(RoomDto | undefined)[]>([]);
	const [filteredChats, setFilteredChats] = useState<ChatItemProps[]>([]);
	const [friends, setFriends] = useState<UserDto[]>([]);
	const [isModalVisible, setModalVisible] = useState(false);
	const [noResults, setNoResults] = useState(false); // State to track no results
	const router = useRouter();
	const isFocused = useIsFocused();

	// Fetch chats from backend
	const fetchChats = useCallback(async () => {
		if (!currentUser) {
			if (!refreshUser) {
				setRefreshUser(true);
			}
			return;
		}
		try {
			const token = await auth.getToken();

			let promises = [];
			promises.push(
				axios.get(`${utils.API_BASE_URL}/users/dms`, {
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
			setFriends(responses[1].data as UserDto[]);
			console.log(responses[1].data);

			const roomPromises: (
				| Promise<AxiosResponse<RoomDto, any>>
				| Promise<undefined>
			)[] = [];
			for (const message of chats) {
				if (message.bodyIsRoomID) {
					//roomIDs.push(message.messageBody);
					roomPromises.push(rooms.getRoomInfo(message.messageBody));
				} else {
					roomPromises.push(Promise.resolve(undefined));
				}
			}
			const roomResponses = await Promise.all(roomPromises);
			const tmpRooms: (RoomDto | undefined)[] = [];
			for (const roomResponse of roomResponses) {
				if (roomResponse !== undefined) {
					tmpRooms.push(roomResponse.data as RoomDto);
				} else {
					tmpRooms.push(undefined);
				}
			}
			setMessageRooms(tmpRooms);
			setFilteredChats(createChats(chats, currentUser.userID));
			setUserMessages(chats);
		} catch (error) {
			console.log(error);
			ToastAndroid.show("Failed to load DMs", ToastAndroid.SHORT);
			throw error;
		}
	}, [currentUser, refreshUser, rooms, setRefreshUser]);

	// useEffect(() => {
	// 	if (searchQuery === "") {
	// 		setFilteredChats(initialChats);
	// 	} else {
	// 		const filtered = initialChats.filter((chat) =>
	// 			chat.name.toLowerCase().includes(searchQuery.toLowerCase()),
	// 		);
	// 		promises.push(
	// 			axios.get(`${utils.API_BASE_URL}/users`, {
	// 				headers: { Authorization: `Bearer ${token}` },
	// 			}),
	// 		);
	// 		promises.push(
	// 			axios.get(`${utils.API_BASE_URL}/users/friends`, {
	// 				headers: { Authorization: `Bearer ${token}` },
	// 			}),
	// 		);

	// 		const responses = await Promise.all(promises);
	// 		const chats = responses[0].data as DirectMessageDto[];
	// 		selfRef.current = responses[1].data as UserDto;
	// 		setFriends(responses[2].data as UserDto[]);

	// 		setFilteredChats(createChats(chats, selfRef.current.userID));
	// 		setUserMessages(chats);
	// 	} catch (error) {
	// 		console.log(error);
	// 		ToastAndroid.show("Failed to load DMs", ToastAndroid.SHORT);
	// 		throw error;
	// 	}
	// };

	useEffect(() => {
		if (isFocused) {
			fetchChats();
		}
	}, [fetchChats, isFocused]);

	useEffect(() => {
		fetchChats();
	}, []);

	useEffect(() => {
		if (searchQuery === "") {
			if (currentUser !== undefined) {
				setFilteredChats(createChats(userMessages, currentUser.userID));
			}
		} else {
			if (currentUser !== undefined) {
				const filtered = userMessages.filter((chat) => {
					const senderName = chat.sender.profile_name.toLowerCase();
					const recipientName = chat.recipient.profile_name.toLowerCase();

					return (
						(senderName.includes(searchQuery.toLowerCase()) ||
							recipientName.includes(searchQuery.toLowerCase())) &&
						!senderName.includes(currentUser.username) &&
						!recipientName.includes(currentUser.username)
					);
				});

				setFilteredChats(createChats(filtered, currentUser.userID));
				setNoResults(filtered.length === 0); // Set no results state
			}
		}
	}, [currentUser, searchQuery, userMessages]);

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
					<Ionicons name="search" size={24} color={colors.primary} />
				</TouchableOpacity>
			</View>
			{noResults ? (
				<Text style={styles.noResultsText}>No results found.</Text> // Message when no results
			) : (
				<FlatList
					data={filteredChats}
					keyExtractor={(item) => item.message.pID}
					renderItem={({ item }) => (
						<ChatItem message={item.message} otherUser={item.otherUser} />
					)}
				/>
			)}
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
				<CreateChatScreen closeModal={toggleModal} />
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
		marginTop: 10,
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 20,
		borderColor: "#ccc",
		borderWidth: 1,
		borderRadius: 56,
		paddingHorizontal: 15,
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
	noResultsText: {
		// Style for no results message
		textAlign: "center",
		color: "gray",
		marginTop: 20,
	},
});

export default ChatListScreen;
