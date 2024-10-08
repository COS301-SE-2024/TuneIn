import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { DirectMessageDto } from "../models/DmDto";
import { UserDto } from "../models/UserDto";
import { colors } from "react-native-elements";

export interface ChatItemProps {
	message: DirectMessageDto;
	otherUser: UserDto;
	unreadCount: number; // New prop to track unread messages
}

const ChatItem: React.FC<ChatItemProps> = ({
	message,
	otherUser,
	unreadCount,
}) => {
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

			{/* Display unread message count if there are any */}
			{unreadCount > 0 && (
				<View style={styles.unreadBadge}>
					<Text style={styles.unreadBadgeText}>
						{unreadCount > 10 ? "10+" : unreadCount}
					</Text>
				</View>
			)}
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
	unreadBadge: {
		backgroundColor: colors.primary,
		borderRadius: 12,
		width: 24,
		height: 24,
		justifyContent: "center",
		alignItems: "center",
		marginLeft: 10,
	},
	unreadBadgeText: {
		color: "white",
		fontWeight: "bold",
		fontSize: 12,
	},
});

export default ChatItem;
