import React, { useState } from "react";
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
import { Message } from "../../models/message";
import { UserDto, SongInfoDto } from "../../../api-client";
import auth from "../../services/AuthManagement";
import * as utils from "../../services/Utils";
import { live, DirectMessage } from "../../services/Live";
import axios from "axios";

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
	profileName: "John Doe",
	userID: "1",
	username: "johndoe",
	profilePictureUrl:
		"https://images.pexels.com/photos/3792581/pexels-photo-3792581.jpeg",
	followers: { count: 0, data: [] },
	following: { count: 0, data: [] },
	links: { count: 0, data: [] },
	bio: "Hello, I'm John Doe",
	currentSong: {
		title: "Song Title",
		artists: ["Artist 1", "Artist 2"],
		cover: "https://via.placeholder.com/150",
		startTime: new Date(),
	},
	favGenres: { count: 0, data: [] },
	favSongs: { count: 0, data: [] },
	favRooms: { count: 0, data: [] },
	recentRooms: { count: 0, data: [] },
};

const defaultMe: UserDto = {
	profileName: "Me",
	userID: "0",
	username: "me",
	profilePictureUrl:
		"https://images.pexels.com/photos/3792581/pexels-photo-3792581.jpeg",
	followers: { count: 0, data: [] },
	following: { count: 0, data: [] },
	links: { count: 0, data: [] },
	bio: "Hello, I'm Me",
	currentSong: {
		title: "Song Title",
		artists: ["Artist 1", "Artist 2"],
		cover: "https://via.placeholder.com/150",
		startTime: new Date(),
	},
	favGenres: { count: 0, data: [] },
	favSongs: { count: 0, data: [] },
	favRooms: { count: 0, data: [] },
	recentRooms: { count: 0, data: [] },
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

//path: http://localhost:8081/screens/messaging/ChatScreen?name=John%20Doe
const ChatScreen = () => {
	const [message, setMessage] = useState("");
	const [messages, setMessages] = useState<DirectMessage[]>(dummyMessages);
	const router = useRouter();
	const { friend } = useLocalSearchParams();

	let self: UserDto = defaultUser;
	let otherUser: UserDto = defaultUser;
	const getUsers = async () => {
		try {
			const token = await auth.getToken();
			const userPromises = [];
			try {
				const p1 = axios.get(`${utils.API_BASE_URL}/users`, {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});
				userPromises.push(p1);

				const p2 = axios.get(`${utils.API_BASE_URL}/users/${friend}`, {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});
				userPromises.push(p2);

				const responses = await Promise.all(userPromises);
				const r1 = responses[0].data as UserDto;
				const r2 = responses[1].data as UserDto;
				return [r1, r2];
			} catch (error) {
				console.error("Error fetching users' information");
				throw error;
			}
		} catch (error) {
			console.error("Something went wrong while fetching user information");
			throw error;
		}
	};

	getUsers()
		.then(([r1, r2]) => {
			otherUser = r1;
			self = r2;
		})
		.catch((error) => {
			console.error("Failed to fetch users", error);
		});

	const avatarUrl =
		"https://images.pexels.com/photos/3792581/pexels-photo-3792581.jpeg";

	const handleSend = () => {
		/*
		if (message.trim()) {
			messages.push({
				id: String(messages.length + 1),
				text: message,
				sender: "Me",
				me: true,
			});
			setMessage("");
		}
			*/
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
				<Image source={{ uri: avatarUrl }} style={styles.avatar} />
				<Text style={styles.headerTitle}>{otherUser.profileName}</Text>
			</View>
			<FlatList
				data={messages}
				keyExtractor={(item) => item.message.pID}
				renderItem={({ item }) => <MessageItem message={item} />}
				contentContainerStyle={styles.messagesContainer}
			/>
			<View style={styles.inputContainer}>
				<TextInput
					placeholder="Message..."
					style={styles.input}
					value={message}
					onChangeText={setMessage}
				/>
				<TouchableOpacity
					style={styles.sendButton}
					testID="sendButton"
					onPress={handleSend}
				>
					<Image
						source={{
							uri: "https://img.icons8.com/material-outlined/24/000000/filled-sent.png",
						}}
						style={styles.sendIcon}
					/>
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
		backgroundColor: "#08bdbd", // Updated to verdigris color
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
	sendIcon: {
		width: 24,
		height: 24,
	},
});

export default ChatScreen;
