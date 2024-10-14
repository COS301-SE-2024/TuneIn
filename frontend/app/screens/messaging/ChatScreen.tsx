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
import * as utils from "../../services/Utils";
import { useLive } from "../../LiveContext";
import { DirectMessage } from "../../hooks/useDMControls";
import axios from "axios";
import { colors } from "../../styles/colors";
import Feather from "@expo/vector-icons/Feather";
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
	const [dmError, setError] = useState<boolean>(false);
	const [unreadCount, setUnreadCount] = useState<number>(0); // To store unread message count
	const [showBanner, setShowBanner] = useState<boolean>(false); // Control banner visibility
	const router = useRouter();
	let { username } = useLocalSearchParams<{ username: string }>();
	const flatListRef = useRef<FlatList>(null); // FlatList reference

	const cleanup = async () => {
		console.log("Cleaning up DM");
		if (socketHandshakes.dmJoined) {
			console.log("Leaving DM");
			leaveDM();
		}
	};

	useEffect(() => {
		if (socketHandshakes.dmJoined) {
			if (!directMessages || directMessages.length === 0) {
				if (!socketHandshakes.dmsReceived) {
					dmControls.requestDirectMessageHistory();
				}
			}
		}
		// Scroll to the bottom whenever messages change
		if (directMessages.length > 0) {
			flatListRef.current?.scrollToEnd({ animated: true });
		}
	}, [messages, u]);

	// Check unread messages and show banner
	useEffect(() => {
		const unreadMessagesFromOther = messages.filter(
			(msg) => !msg.message.isRead && !msg.me,
		);
		setUnreadCount(unreadMessagesFromOther.length);
		setShowBanner(unreadMessagesFromOther.length > 0); // Show banner only if there are unread messages from the other person

		if (unreadMessagesFromOther.length > 0) {
			const oldestUnreadMessageIndex = messages.findIndex(
				(msg) => !msg.message.isRead && !msg.me,
			);
			if (oldestUnreadMessageIndex !== -1) {
				flatListRef.current?.scrollToIndex({
					index: oldestUnreadMessageIndex,
					animated: true,
				});
			}
		}
	}, [messages]);

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
					<Image
						source={{
							uri: dmParticipants[0].profile_picture_url,
						}}
						style={styles.avatar}
					/>
				)}
				<Text style={styles.headerTitle}>
					{dmError ? "Failed" : dmParticipants[0]?.profile_name || "Loading..."}
				</Text>
			</View>

			<FlatList
				ref={flatListRef}
				data={messages}
				keyExtractor={(item) => item.message.index.toString()}
				renderItem={({ item }) => (
					<>
						{showBanner &&
							!item.me &&
							item.message.index ===
								messages.findIndex((msg) => !msg.message.isRead && !msg.me) && (
								<View style={styles.bannerContainer}>
									<View style={styles.unreadBanner}>
										<Text style={styles.unreadBannerText}>
											You have {unreadCount} unread message
											{unreadCount > 1 ? "s" : ""}
										</Text>
									</View>
								</View>
							)}
						<MessageItem message={item} />
					</>
				)}
				contentContainerStyle={styles.messagesContainer}
				getItemLayout={(data, index) => ({
					length: 60,
					offset: 60 * index,
					index,
				})}
				onScrollToIndexFailed={(info) => {
					const wait = new Promise((resolve) => setTimeout(resolve, 500));
					wait.then(() => {
						flatListRef.current?.scrollToIndex({
							index: info.index,
							animated: true,
						});
					});
				}}
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
	bannerContainer: {
		alignItems: "center", // Center banner and lines together
		marginVertical: 15, // Space around the banner container
		backgroundColor: "#E0E0E0",
		paddingVertical: 1,
		marginHorizontal: -20,
	},
	unreadBanner: {
		backgroundColor: colors.primary, // White background for the bubble
		borderRadius: 25, // Rounded bubble shape
		borderWidth: 2, // Grey border
		borderColor: "#E0E0E0", // Light grey color for the edges
		paddingVertical: 10, // Padding inside the bubble
		paddingHorizontal: 20, // Padding to make the bubble wider
	},
	unreadBannerText: {
		color: "#333333", // Darker text color
		fontSize: 15, // Adjust font size
		fontWeight: "bold", // Bold text
		textAlign: "center", // Center text inside the bubble
	},
	inputContainer: {
		flexDirection: "row",
		alignItems: "center",
		borderTopWidth: 1,
		borderTopColor: "#E0E0E0",
		paddingHorizontal: 10,
		paddingVertical: 5,
	},
	input: {
		flex: 1,
		height: 40,
		borderWidth: 1,
		borderColor: "#E0E0E0",
		borderRadius: 20,
		paddingHorizontal: 10,
		marginRight: 10,
	},
	sendButton: {
		padding: 10,
	},
});

export default ChatScreen;
