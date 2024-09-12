import React, { useEffect, useState, useCallback } from "react";
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
import MessageItem from "../../components/messaging/MessageItem"; // Assuming you have a component to render each message
import { UserDto } from "../../models/UserDto";
import auth from "../../services/AuthManagement";
import * as utils from "../../services/Utils";
import { live, DirectMessage, instanceExists } from "../../services/Live";
import axios from "axios";
import { colors } from "../../styles/colors";
import Feather from "@expo/vector-icons/Feather";

const ChatScreen = () => {
	const [self, setSelf] = useState<UserDto>();
	const [otherUser, setOtherUser] = useState<UserDto>();
	const [message, setMessage] = useState<string>("");
	const [messages, setMessages] = useState<DirectMessage[]>([]);
	const [connected, setConnected] = useState<boolean>(false);
	const [isSending, setIsSending] = useState<boolean>(false);
	const router = useRouter();
	let { username } = useLocalSearchParams();
	const u: string = Array.isArray(username) ? username[0] : username;
	console.log("Username:", u);

	// Clean up function
	const cleanup = useCallback(async () => {
		console.log("Cleaning up DM");
		if (connected) {
			console.log("Leaving DM");
			await live.leaveDM();
		}
	}, [connected]); // Dependency array for cleanup

	// Fetch messages
	useEffect(() => {
		if (instanceExists()) {
			if (!messages || messages.length === 0) {
				if (live.receivedDMHistory()) {
					setMessages(live.getFetchedDMs());
				}
				live.requestDMHistory(u);
			}
		}
	}, [messages, u]);

	// Initialize users and messaging setup
	useEffect(() => {
		const getUsers = async () => {
			try {
				const token = await auth.getToken();
				const userPromises = [
					axios.get(`${utils.API_BASE_URL}/users`, {
						headers: { Authorization: `Bearer ${token}` },
					}),
					axios.get(`${utils.API_BASE_URL}/users/${u}`, {
						headers: { Authorization: `Bearer ${token}` },
					}),
				];
				const [selfResponse, otherUserResponse] =
					await Promise.all(userPromises);
				setSelf(selfResponse.data as UserDto);
				setOtherUser(otherUserResponse.data as UserDto);
				console.log(
					"Fetched users:",
					selfResponse.data,
					otherUserResponse.data,
				);
				await live.enterDM(
					selfResponse.data.userID,
					otherUserResponse.data.userID,
					setMessages,
					setConnected,
				);
				if (!live.receivedDMHistory()) {
					live.requestDMHistory(otherUserResponse.data.userID);
				}
			} catch (error) {
				console.error("Failed to setup DM", error);
			}
		};

		const initialize = async () => {
			try {
				if (instanceExists()) {
					await live.initialiseSocket();
				}
				await getUsers();
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
	}, [u, cleanup]); // Ensure that `u` and `cleanup` are dependencies

	// Function to send a standard message
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
			messageSent: false,
		};
		setIsSending(true);
		setMessage("");
		live.sendDM(newMessage, otherUser).finally(() => {
			setIsSending(false);
		});
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
				{otherUser && otherUser.profile_picture_url && (
					<Image
						source={{ uri: otherUser.profile_picture_url }}
						style={styles.avatar}
					/>
				)}
				<Text style={styles.headerTitle}>
					{otherUser?.profile_name || "Loading..."}
				</Text>
			</View>

			<FlatList
				data={messages}
				keyExtractor={(item) => {
					if (item.message.index !== undefined) {
						return item.message.index.toString();
					} else if (item.message.room?.roomID) {
						return item.message.room.roomID;
					}
					return ""; // Fallback to an empty string or some unique identifier
				}}
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
	testButtonContainer: {
		flexDirection: "row", // Align buttons horizontally
		justifyContent: "center", // Center the buttons horizontally
		margin: 10, // Add some margin around the container
	},
	testButton: {
		backgroundColor: "#007BFF", // Button background color
		padding: 10, // Add padding inside the button
		margin: 5, // Add margin between buttons
		borderRadius: 5, // Rounded corners
		alignItems: "center", // Center the text inside the button
		justifyContent: "center", // Center the text inside the button
	},
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
