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
import auth from "../../services/AuthManagement";
import * as utils from "../../services/Utils";
import { DirectMessage, useLive } from "../../LiveContext";
import axios from "axios";
import { colors } from "../../styles/colors";
import Feather from "@expo/vector-icons/Feather";
import { UserDto } from "../../../api";

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
			dateSent: new Date().toISOString(),
			dateRead: new Date().toISOString(),
			isRead: false,
			pID: "p1",
		},
		me: false,
		messageSent: true,
		isOptimistic: false,
	},
	{
		message: {
			index: 2,
			messageBody: "Hi! How are you?",
			sender: defaultMe,
			recipient: defaultUser,
			dateSent: new Date().toISOString(),
			dateRead: new Date().toISOString(),
			isRead: false,
			pID: "p2",
		},
		me: true,
		messageSent: true,
		isOptimistic: false,
	},
	{
		message: {
			index: 3,
			messageBody: "I'm good, thanks!",
			sender: defaultUser,
			recipient: defaultMe,
			dateSent: new Date().toISOString(),
			dateRead: new Date().toISOString(),
			isRead: false,
			pID: "p3",
		},
		me: false,
		messageSent: true,
		isOptimistic: false,
	},
	{
		message: {
			index: 4,
			messageBody: "What are you up to?",
			sender: defaultUser,
			recipient: defaultMe,
			dateSent: new Date().toISOString(),
			dateRead: new Date().toISOString(),
			isRead: false,
			pID: "p4",
		},
		me: false,
		messageSent: true,
		isOptimistic: false,
	},
	{
		message: {
			index: 5,
			messageBody: "Just working on a new project",
			sender: defaultMe,
			recipient: defaultUser,
			dateSent: new Date().toISOString(),
			dateRead: new Date().toISOString(),
			isRead: false,
			pID: "p5",
		},
		me: true,
		messageSent: true,
		isOptimistic: false,
	},
	{
		message: {
			index: 6,
			messageBody: "That's great! I'd love to hear more about it",
			sender: defaultUser,
			recipient: defaultMe,
			dateSent: new Date().toISOString(),
			dateRead: new Date().toISOString(),
			isRead: false,
			pID: "p6",
		},
		me: false,
		messageSent: true,
		isOptimistic: false,
	},
	{
		message: {
			index: 7,
			messageBody: "Sure! I'll tell you more about it later",
			sender: defaultMe,
			recipient: defaultUser,
			dateSent: new Date().toISOString(),
			dateRead: new Date().toISOString(),
			isRead: false,
			pID: "p7",
		},
		me: true,
		messageSent: true,
		isOptimistic: false,
	},
	{
		message: {
			index: 8,
			messageBody: "Sounds good!",
			sender: defaultUser,
			recipient: defaultMe,
			dateSent: new Date().toISOString(),
			dateRead: new Date().toISOString(),
			isRead: false,
			pID: "p8",
		},
		me: false,
		messageSent: true,
		isOptimistic: false,
	},
	{
		message: {
			index: 9,
			messageBody: "Bye!",
			sender: defaultUser,
			recipient: defaultMe,
			dateSent: new Date().toISOString(),
			dateRead: new Date().toISOString(),
			isRead: false,
			pID: "p9",
		},
		me: false,
		messageSent: true,
		isOptimistic: false,
	},
	{
		message: {
			index: 10,
			messageBody: "Bye!",
			sender: defaultMe,
			recipient: defaultUser,
			dateSent: new Date().toISOString(),
			dateRead: new Date().toISOString(),
			isRead: false,
			pID: "p10",
		},
		me: true,
		messageSent: true,
		isOptimistic: false,
	},
	// Add more messages here if needed
];

//path: http://localhost:8081/screens/messaging/ChatScreen?friend=8xbbie
const ChatScreen = () => {
	const {
		roomControls,
		currentUser,
		enterDM,
		leaveDM,
		dmControls,
		dmsConnected,
		dmsReceived,
		dmParticipants,
		directMessages,
	} = useLive();
	const [message, setMessage] = useState<string>("");
	const router = useRouter();
	let { username } = useLocalSearchParams();
	const u: string = Array.isArray(username) ? username[0] : username;
	console.log("Username:", u);

	const cleanup = async () => {
		console.log("Cleaning up DM");
		if (dmsConnected) {
			console.log("Leaving DM");
			leaveDM();
		}
	};

	useEffect(() => {
		if (dmsConnected) {
			if (!directMessages || directMessages.length === 0) {
				if (!dmsReceived) {
					dmControls.requestDirectMessageHistory();
				}
			}
		}
	}, [directMessages]);

	//on component mount
	useEffect(() => {
		const initialize = async () => {
			try {
				await enterDM([u]);
				if (!dmsReceived) {
					dmControls.requestDirectMessageHistory();
				}
			} catch (error) {
				console.error("Failed to setup DM", error);
			}
		};
		initialize();
		return () => {
			cleanup()
				.then(() => {
					console.log("Cleaned up DM");
				})
				.catch((error) => {
					console.error("Failed to clean up DM", error);
				});
		};
	}, []);

	const handleSend = () => {
		if (!currentUser || dmParticipants.length <= 0) return;
		const newMessage: DirectMessage = {
			message: {
				index: directMessages.length,
				messageBody: message,
				sender: currentUser,
				recipient: dmParticipants[0],
				dateSent: new Date().toISOString(),
				dateRead: new Date(0).toISOString(),
				isRead: false,
				pID: "",
			},
			me: true,
			messageSent: false,
			isOptimistic: true,
		};
		dmControls.sendDirectMessage(newMessage);
		setMessage("");
	};

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<TouchableOpacity
					onPress={() => {
						router.back();
						cleanup()
							.then(() => {
								console.log("Cleaned up DM");
							})
							.catch((error) => {
								console.error("Failed to clean up DM", error);
							});
					}}
					testID="backButton"
					style={styles.backButton}
				>
					<Ionicons name="chevron-back" size={24} color="black" />
				</TouchableOpacity>
				{dmParticipants[0] && dmParticipants[0].profile_picture_url && (
					<Image
						source={{
							uri: dmParticipants[0].profile_picture_url,
						}}
						style={styles.avatar}
					/>
				)}
				<Text style={styles.headerTitle}>
					{dmParticipants[0]?.profile_name || "Loading..."}
				</Text>
			</View>
			<FlatList
				data={directMessages}
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
					testID="messageInput"
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
