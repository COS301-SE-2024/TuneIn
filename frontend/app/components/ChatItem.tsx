import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Chat } from "../models/chat";
import { DirectMessageDto, UserDto } from "../../api";

export interface ChatItemProps {
	message: DirectMessageDto;
	otherUser: UserDto;
}

const ChatItem: React.FC<ChatItemProps> = ({ message, otherUser }) => {
	const router = useRouter();

	return (
		<TouchableOpacity
			testID="chat-item-touchable"
			style={styles.container}
			onPress={() =>
				router.push(
					`/screens/messaging/ChatScreen?username=${otherUser.username}`,
				)
			}
		>
			<Image
				source={{ uri: otherUser.profile_picture_url }}
				testID="chat-item-avatar"
				style={styles.avatar}
			/>
			<View style={{ flex: 1 }}>
				<Text style={styles.name}>{otherUser.profile_name}</Text>
				<Text style={styles.lastMessage}>{message.messageBody}</Text>
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
