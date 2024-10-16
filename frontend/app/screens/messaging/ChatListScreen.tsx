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
		const otherUser =
			message.sender.userID === selfID ? message.recipient : message.sender;

		// Calculate unread message count for this chat
		const unreadMessages = messages.filter(
			(m) =>
				m.sender.userID !== selfID &&
				!m.isRead &&
				m.sender.userID === otherUser.userID,
		).length;

		chats.push({
			message: message,
			otherUser: otherUser,
			unreadCount: unreadMessages, // Add unread count for this chat
		});
	}
	return chats;
};

const ChatListScreen = () => {
	const {
		currentUser,
		refreshUser,
		setRefreshUser,
		recentDMs,
		setFetchRecentDMs,
	} = useLive();
	const [searchQuery, setSearchQuery] = useState("");
	const [localRecentDMs, setLocalRecentDMs] =
		useState<{ message: DirectMessageDto; room?: RoomDto }[]>(recentDMs);
	const [filteredChats, setFilteredChats] = useState<ChatItemProps[]>([]);
	const [isModalVisible, setModalVisible] = useState(false);
	const [noResults, setNoResults] = useState(false); // State to track no results
	const router = useRouter();
	const isFocused = useIsFocused();

	const localStateOutdated = useCallback(() => {
		if (currentUser !== undefined) {
			if (recentDMs.length !== localRecentDMs.length) {
				return true;
			}
			for (let i = 0; i < recentDMs.length; i++) {
				if (recentDMs[i].message.pID !== localRecentDMs[i].message.pID) {
					return true;
				}
			}
		}
		return false;
	}, [currentUser, recentDMs, localRecentDMs]);

	const getMessages = useCallback(
		(recents: { message: DirectMessageDto }[]) => {
			const messages: DirectMessageDto[] = [];
			for (const recent of recents) {
				messages.push(recent.message);
			}
			return messages;
		},
		[],
	);

	useEffect(() => {
		if (isFocused) {
			if (localStateOutdated()) {
				setFetchRecentDMs(true);
			}
		}
	}, [recentDMs, isFocused, localStateOutdated, setFetchRecentDMs]);

	useEffect(() => {
		if (isFocused) {
			if (localStateOutdated()) {
				setFetchRecentDMs(true);
			}
		}
	}, []);

	useEffect(() => {
		if (searchQuery === "") {
			if (currentUser !== undefined) {
				const messages: DirectMessageDto[] = getMessages(localRecentDMs);
				setFilteredChats(createChats(messages, currentUser.userID));
			}
		} else {
			if (currentUser !== undefined) {
				const messages: DirectMessageDto[] = getMessages(localRecentDMs);
				const filtered = messages.filter((chat) => {
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
	}, [currentUser, searchQuery, localRecentDMs, getMessages]);

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
						<ChatItem
							message={item.message}
							otherUser={item.otherUser}
							unreadCount={item.unreadCount} // Pass unread count here
						/>
					)}
				/>
			)}
			<TouchableOpacity
				testID="new-chat-button"
				style={styles.newChatButton}
				onPress={toggleModal}
			>
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
