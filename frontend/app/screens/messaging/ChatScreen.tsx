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
		roomControls,
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
	const router = useRouter();
	let { username } = useLocalSearchParams();
	const u: string = Array.isArray(username) ? username[0] : username;
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
	}, [directMessages]);

	// on component mount
	useEffect(() => {
		const initialize = async () => {
			try {
				await enterDM([u]);
				if (!socketHandshakes.dmsReceived) {
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
