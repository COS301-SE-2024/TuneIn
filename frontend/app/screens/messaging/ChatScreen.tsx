import React, { useEffect, useState, useRef } from "react";
import {
	View,
	Text,
	TextInput,
	FlatList,
	TouchableOpacity,
	Image,
	StyleSheet,
	ToastAndroid,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import MessageItem from "../../components/MessageItem";
import auth from "../../services/AuthManagement";
import * as crypto from "../../services/EncryptionService";
import * as utils from "../../services/Utils";
import { useLive } from "../../LiveContext";
import { DirectMessage } from "../../hooks/useDMControls";
import axios from "axios";
import { colors } from "../../styles/colors";
import Feather from "@expo/vector-icons/Feather";
import * as SecureStore from "expo-secure-store";
import { UserDto } from "../../../api";

const ChatScreen = () => {
	const {
		currentUser,
		enterDM,
		leaveDM,
		dmControls,
		dmParticipants,
		directMessages,
		socketHandshakes,
	} = useLive();
	const [message, setMessage] = useState<string>("");
	const [publicKey, setPublicKey] = useState<string>("");
	const [dmError, setError] = useState<boolean>(false);
	const router = useRouter();
	let { username } = useLocalSearchParams<{ username: string }>();
	const flatListRef = useRef<FlatList>(null); // FlatList reference

	// Scroll to the bottom whenever messages change
	useEffect(() => {
		if (messages.length > 0) {
			flatListRef.current?.scrollToEnd({ animated: true });
		}
	}, [messages]);

	const getPublicKey = async () => {
		try {
			const token = await auth.getToken();
			const result = await axios.get(
				`${utils.API_BASE_URL}/users/${u}/publicKey`,
				{
					headers: { Authorization: `Bearer ${token}` },
				},
			);

			setPublicKey(result.data);
		} catch (error) {
			console.log("Error fetching public key", error);
		}
	};

	const checkKey = async () => {
		const symKey = await SecureStore.getItemAsync(`${u}-symKey`);
		if (symKey === null) {
		}
	};

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
			const [selfResponse, otherUserResponse] = await Promise.all(userPromises);
			return [selfResponse.data as UserDto, otherUserResponse.data as UserDto];
		} catch (error) {
			console.log("Error fetching users' information", error);
			setError(true);
			ToastAndroid.show("Failed to load DMs", ToastAndroid.SHORT);
			throw error;
		}
	};

	const cleanup = async () => {
		console.log("Cleaning up DM");
		if (socketHandshakes.dmJoined) {
			console.log("Leaving DM");
			leaveDM();
		}
	};

	useEffect(() => {
		const getMessages = async () => {
			if (instanceExists()) {
				if (!messages || messages.length === 0) {
					if (live.receivedDMHistory()) {
						const privateKey =
							(await SecureStore.getItemAsync("privateKey")) || "";
						const decryptedMessages: DirectMessage[] = live
							.getFetchedDMs()
							.map(async (dm) => {
								const decryptedMessage = await crypto.decryptMessage(
									dm.message.messageBody,
									privateKey,
									publicKey,
								);
								return {
									...dm,
									messageBody: decryptedMessage,
								};
							});
						setMessages(decryptedMessages);
					}
					live.requestDMHistory(u);
				}
			}
		};

		getMessages();
	}, [messages, u]);

	// on component mount
	useEffect(() => {
		const initialize = async () => {
			try {
				if (!socketHandshakes.dmJoined) {
					const user = dmParticipants.find((u) => u.username === username);
					if (!user) {
						await enterDM([username]);
						dmControls.requestDirectMessageHistory();
					}
				}
				// if (!socketHandshakes.dmsReceived) {
				// 	dmControls.requestDirectMessageHistory();
				// }
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

	const handleSend = async () => {
		const privateKey = (await SecureStore.getItemAsync("privateKey")) || "";
		const encryptedMessage = await crypto.encryptMessage(
			message,
			privateKey,
			publicKey,
		);
		if (!currentUser || dmParticipants.length <= 0) return;
		const newMessage: DirectMessage = {
			message: {
				index: messages.length,
				messageBody: encryptedMessage,
				sender: self,
				recipient: otherUser,
				dateSent: new Date(),
				dateRead: new Date(0),
				isRead: false,
				pID: "",
				bodyIsRoomID: false,
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
					<TouchableOpacity
						onPress={() => {
							router.push(
								`/screens/profile/ProfilePage?friend=${JSON.stringify({
									username: dmParticipants[0].username,
									profile_picture_url: dmParticipants[0].profile_picture_url,
									userID: dmParticipants[0].userID,
								})}&user=${dmParticipants[0].username}`,
							);
						}}
					>
						<Image
							source={{
								uri: dmParticipants[0].profile_picture_url,
							}}
							style={styles.avatar}
						/>
					</TouchableOpacity>
				)}
				<Text style={styles.headerTitle}>
					{dmError ? "Failed" : dmParticipants[0]?.profile_name || "Loading..."}
				</Text>
			</View>
			<FlatList
				ref={flatListRef} // Reference to control scrolling
				data={directMessages}
				keyExtractor={(item) => item.message.index.toString()}
				renderItem={({ item }) => <MessageItem message={item} />}
				contentContainerStyle={styles.messagesContainer}
				onContentSizeChange={() =>
					flatListRef.current?.scrollToEnd({ animated: true })
				} // Scroll on content size change
			/>
			{!dmError && (
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
			)}
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
