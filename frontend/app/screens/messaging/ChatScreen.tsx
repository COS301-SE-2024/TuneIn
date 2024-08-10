import React, { useEffect, useState } from "react";
import {
	View,
	Text,
	TextInput,
	FlatList,
	TouchableOpacity,
	Image,
	StyleSheet,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import MessageItem from "../../components/MessageItem";
import { UserDto } from "../../models/UserDto";
import auth from "../../services/AuthManagement";
import * as utils from "../../services/Utils";
import { live, DirectMessage, instanceExists } from "../../services/Live";
import axios from "axios";
import { colors } from "../../styles/colors";
import Feather from "@expo/vector-icons/Feather";

/*
const dummyMessages: Message[] = [
	{ id: "1", text: "Hey there!", sender: "John Doe", me: false },
	{ id: "2", text: "Hi! How are you?", sender: "Me", me: true },
	{ id: "3", text: "I'm good, thanks!", sender: "John Doe", me: false },
	{ id: "4", text: "What are you up to?", sender: "John Doe", me: false },
	{ id: "5", text: "Just working on a new project", sender: "Me", me: true },
	{
		id: "6",
		text: "That's great! I'd love to hear more about it",
		sender: "John Doe",
		me: false,
	},
	{
		id: "7",
		text: "Sure! I'll tell you more about it later",
		sender: "Me",
		me: true,
	},
	{ id: "8", text: "Sounds good!", sender: "John Doe", me: false },
	{ id: "9", text: "Bye!", sender: "John Doe", me: false },
	{ id: "10", text: "Bye!", sender: "Me", me: true },
	// Add more messages here
];
*/

const defaultUser: UserDto = {
	profile_name: "John Doe",
	userID: "1",
	username: "johndoe",
	profile_picture_url:
		"https://images.pexels.com/photos/3792581/pexels-photo-3792581.jpeg",
	followers: { count: 0, data: [] },
	following: { count: 0, data: [] },
	links: { count: 0, data: [] },
	bio: "Hello, I'm John Doe",
	current_song: {
		title: "Song Title",
		artists: ["Artist 1", "Artist 2"],
		cover: "https://via.placeholder.com/150",
		start_time: new Date(),
	},
	fav_genres: { count: 0, data: [] },
	fav_songs: { count: 0, data: [] },
	fav_rooms: { count: 0, data: [] },
	recent_rooms: { count: 0, data: [] },
};

const defaultMe: UserDto = {
	profile_name: "Me",
	userID: "0",
	username: "me",
	profile_picture_url:
		"https://images.pexels.com/photos/3792581/pexels-photo-3792581.jpeg",
	followers: { count: 0, data: [] },
	following: { count: 0, data: [] },
	links: { count: 0, data: [] },
	bio: "Hello, I'm Me",
	current_song: {
		title: "Song Title",
		artists: ["Artist 1", "Artist 2"],
		cover: "https://via.placeholder.com/150",
		start_time: new Date(),
	},
	fav_genres: { count: 0, data: [] },
	fav_songs: { count: 0, data: [] },
	fav_rooms: { count: 0, data: [] },
	recent_rooms: { count: 0, data: [] },
};

const dummyMessages: DirectMessage[] = [
	{
		message: {
			index: 1,
			messageBody: "Hey there!",
			sender: defaultUser,
			recipient: defaultMe,
			dateSent: new Date(),
			dateRead: new Date(),
			isRead: false,
			pID: "p1",
		},
		me: false,
	},
	{
		message: {
			index: 2,
			messageBody: "Hi! How are you?",
			sender: defaultMe,
			recipient: defaultUser,
			dateSent: new Date(),
			dateRead: new Date(),
			isRead: false,
			pID: "p2",
		},
		me: true,
	},
	{
		message: {
			index: 3,
			messageBody: "I'm good, thanks!",
			sender: defaultUser,
			recipient: defaultMe,
			dateSent: new Date(),
			dateRead: new Date(),
			isRead: false,
			pID: "p3",
		},
		me: false,
	},
	{
		message: {
			index: 4,
			messageBody: "What are you up to?",
			sender: defaultUser,
			recipient: defaultMe,
			dateSent: new Date(),
			dateRead: new Date(),
			isRead: false,
			pID: "p4",
		},
		me: false,
	},
	{
		message: {
			index: 5,
			messageBody: "Just working on a new project",
			sender: defaultMe,
			recipient: defaultUser,
			dateSent: new Date(),
			dateRead: new Date(),
			isRead: false,
			pID: "p5",
		},
		me: true,
	},
	{
		message: {
			index: 6,
			messageBody: "That's great! I'd love to hear more about it",
			sender: defaultUser,
			recipient: defaultMe,
			dateSent: new Date(),
			dateRead: new Date(),
			isRead: false,
			pID: "p6",
		},
		me: false,
	},
	{
		message: {
			index: 7,
			messageBody: "Sure! I'll tell you more about it later",
			sender: defaultMe,
			recipient: defaultUser,
			dateSent: new Date(),
			dateRead: new Date(),
			isRead: false,
			pID: "p7",
		},
		me: true,
	},
	{
		message: {
			index: 8,
			messageBody: "Sounds good!",
			sender: defaultUser,
			recipient: defaultMe,
			dateSent: new Date(),
			dateRead: new Date(),
			isRead: false,
			pID: "p8",
		},
		me: false,
	},
	{
		message: {
			index: 9,
			messageBody: "Bye!",
			sender: defaultUser,
			recipient: defaultMe,
			dateSent: new Date(),
			dateRead: new Date(),
			isRead: false,
			pID: "p9",
		},
		me: false,
	},
	{
		message: {
			index: 10,
			messageBody: "Bye!",
			sender: defaultMe,
			recipient: defaultUser,
			dateSent: new Date(),
			dateRead: new Date(),
			isRead: false,
			pID: "p10",
		},
		me: true,
	},
	// Add more messages here if needed
];

//path: http://localhost:8081/screens/messaging/ChatScreen?friend=8xbbie
const ChatScreen = () => {
	const [self, setSelf] = useState<UserDto | null>(null);
	const [otherUser, setOtherUser] = useState<UserDto | null>(null);
	const [message, setMessage] = useState("");
	const [messages, setMessages] = useState<DirectMessage[]>([]);
	const [connected, setConnected] = useState(false);
	const [isSending, setIsSending] = useState(false);
	const router = useRouter();
	const { friend } = useLocalSearchParams();

	const getUsers = async () => {
		try {
			const token = await auth.getToken();
			const userPromises = [
				axios.get(`${utils.API_BASE_URL}/users`, {
					headers: { Authorization: `Bearer ${token}` },
				}),
				axios.get(`${utils.API_BASE_URL}/users/${friend}`, {
					headers: { Authorization: `Bearer ${token}` },
				}),
			];
			const [selfResponse, otherUserResponse] = await Promise.all(userPromises);
			return [selfResponse.data as UserDto, otherUserResponse.data as UserDto];
		} catch (error) {
			console.error("Error fetching users' information", error);
			throw error;
		}
	};

	useEffect(() => {
		if (instanceExists()) {
			if (!messages || messages.length === 0) {
				if (live.receivedDMHistory()) {
					setMessages(live.getFetchedDMs());
				}
				live.requestDMHistory(Array.isArray(friend) ? friend[0] : friend);
			}
		}
	}, [messages, friend]);

	useEffect(() => {
		const initialize = async () => {
			try {
				if (instanceExists()) {
					await live.initialiseSocket();
				}
				const [fetchedSelf, fetchedOtherUser] = await getUsers();
				setSelf(fetchedSelf);
				setOtherUser(fetchedOtherUser);
				console.log("Fetched users:", fetchedSelf, fetchedOtherUser);
				console.log(self);
				console.log(otherUser);
				await live.enterDM(
					fetchedSelf.userID,
					fetchedOtherUser.userID,
					setMessages,
					setMessage,
					setConnected,
				);
				if (!live.receivedDMHistory()) {
					live.requestDMHistory(fetchedOtherUser.userID);
				}
			} catch (error) {
				console.error("Failed to setup DM", error);
			}
		};
		initialize();
		return () => {
			const cleanup = async () => {
				if (connected) {
					await live.leaveDM();
				}
			};
			cleanup();
		};
	}, [friend]);

	const handleSend = () => {
		if (!self || !otherUser || isSending) return;
		const newMessage: DirectMessage = {
			message: {
				index: messages.length,
				messageBody: message,
				sender: self,
				recipient: otherUser,
				dateSent: new Date(),
				dateRead: new Date(0),
				isRead: false,
				pID: "",
			},
			me: true,
		};
		setIsSending(true);
		live.sendDM(newMessage, otherUser).finally(() => {
			setIsSending(false);
		});
	};

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<TouchableOpacity
					onPress={() => router.back()}
					testID="backButton"
					style={styles.backButton}
				>
					<Ionicons name="chevron-back" size={24} color="black" />
				</TouchableOpacity>
				{otherUser && otherUser.profile_picture_url && (
					<Image
						source={{
							uri: otherUser.profile_picture_url,
						}}
						style={styles.avatar}
					/>
				)}
				<Text style={styles.headerTitle}>
					{otherUser?.profile_name || "Loading..."}
				</Text>
			</View>
			<FlatList
				data={messages}
				keyExtractor={(item) => item.message.index.toString()}
				renderItem={({ item }) => <MessageItem message={item} />}
				contentContainerStyle={styles.messagesContainer}
			/>
			<View style={styles.inputContainer}>
				<TextInput
					placeholder="Message..."
					style={styles.input}
					value={message}
					onChangeText={setMessage}
					onSubmitEditing={handleSend}
				/>
				<TouchableOpacity
					style={styles.sendButton}
					testID="sendButton"
					onPress={handleSend}
				>
					<Feather name="send" size={24} color="black" />
				</TouchableOpacity>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#FFFFFF",
		paddingHorizontal: 10,
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 15,
		paddingHorizontal: 10,
		borderBottomWidth: 1,
		borderBottomColor: "#E0E0E0",
	},
	backButton: {
		marginRight: 16,
	},
	avatar: {
		width: 40,
		height: 40,
		borderRadius: 20,
	},
	headerTitle: {
		fontSize: 18,
		fontWeight: "bold",
		marginLeft: 10,
	},
	messagesContainer: {
		paddingVertical: 10,
		marginHorizontal: 20,
	},
	messageContainer: {
		flexDirection: "row",
		alignItems: "flex-end",
		marginVertical: 4,
	},
	messageContainerMe: {
		justifyContent: "flex-end",
	},
	messageContainerOther: {
		justifyContent: "flex-start",
	},
	messageAvatar: {
		width: 30,
		height: 30,
		borderRadius: 15,
		marginRight: 10,
	},
	messageBubble: {
		paddingVertical: 10,
		paddingHorizontal: 15,
		borderRadius: 25,
		maxWidth: "75%",
	},
	messageBubbleMe: {
		backgroundColor: colors.primary,
		alignSelf: "flex-end",
	},
	messageBubbleOther: {
		backgroundColor: "#ECECEC",
		alignSelf: "flex-start",
	},
	messageText: {
		fontSize: 16,
	},
	inputContainer: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 5,
		paddingHorizontal: 10,
		borderTopWidth: 1,
		borderTopColor: "#E0E0E0",
		backgroundColor: "#FFFFFF",
	},
	input: {
		flex: 1,
		backgroundColor: "#F0F0F0",
		paddingVertical: 10,
		paddingHorizontal: 15,
		borderRadius: 25,
		marginRight: 20,
		marginBottom: 10,
		marginTop: 10,
		marginLeft: 10,
	},
	sendButton: {
		padding: 10,
	},
});

export default ChatScreen;
