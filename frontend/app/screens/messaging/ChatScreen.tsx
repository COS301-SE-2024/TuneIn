// ChatScreen.tsx
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
import { colors } from "../../styles/colors";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Feather from '@expo/vector-icons/Feather';

const messages: Message[] = [
	{ id: "1", text: "Hey there!", sender: "John Doe", me: false },
	{ id: "2", text: "Hi! How are you?", sender: "Me", me: true },
	// Add more dummy messages
];

const ChatScreen = () => {
	const [message, setMessage] = useState("");
	const router = useRouter();
	const { name } = useLocalSearchParams();
	console.log(name);

	const avatarUrl =
		"https://images.pexels.com/photos/3792581/pexels-photo-3792581.jpeg";

	const handleSend = () => {
		if (message.trim()) {
			messages.push({
				id: String(messages.length + 1),
				text: message,
				sender: "Me",
				me: true,
			});
			setMessage("");
		}
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
				<Text style={styles.headerTitle}>{name}</Text>
			</View>
			<FlatList
				data={messages}
				keyExtractor={(item) => item.id}
				renderItem={({ item }) => (
					<MessageItem message={item} avatarUrl={avatarUrl} />
				)}
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
					{/* <Image
						source={{
							uri: "https://img.icons8.com/material-outlined/24/000000/filled-sent.png",
						}}
						style={styles.sendIcon}
					/> */}
					{/* <MaterialCommunityIcons
						name="send-circle-outline"
						size={30}
						color="black"
					/> */}
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
	sendIcon: {
		width: 24,
		height: 24,
	},
});

export default ChatScreen;
