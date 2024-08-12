import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Chat } from "../models/chat";

interface ChatItemProps {
	chat: Chat;
}

const ChatItem: React.FC<ChatItemProps> = ({ chat }) => {
	const router = useRouter();

	return (
		<TouchableOpacity
			testID="chat-item-touchable"
			style={styles.container}
			onPress={() =>
				router.push(
					`/screens/messaging/ChatScreen?name=${chat.name}&avatar=${chat.avatar}`,
				)
			}
		>
			<Image
				testID="chat-item-avatar"
				source={{ uri: chat.avatar }}
				style={styles.avatar}
			/>
			<View style={{ flex: 1 }}>
				<Text style={styles.name}>{chat.name}</Text>
				<Text style={styles.lastMessage}>{chat.lastMessage}</Text>
			</View>
		</TouchableOpacity>
	);
};

const styles = StyleSheet.create({
	container: {
		margin: 10,
		flexDirection: "row",
		alignItems: "center",
		padding: 10,
		borderBottomWidth: 1,
		borderBottomColor: "#D1D5DB",
	},
	avatar: {
		width: 48,
		height: 48,
		borderRadius: 24,
		marginRight: 16,
	},
	name: {
		fontSize: 16,
		fontWeight: "bold",
	},
	lastMessage: {
		fontSize: 14,
		color: "gray",
	},
});

export default ChatItem;
