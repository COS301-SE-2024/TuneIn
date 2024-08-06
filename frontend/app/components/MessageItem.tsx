import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { Message } from "../models/message";
import { colors } from "../styles/colors";

interface MessageItemProps {
	message: Message;
	avatarUrl: string;
}

const MessageItem: React.FC<MessageItemProps> = ({ message, avatarUrl }) => {
	return (
		<View
			style={[
				styles.container,
				message.me ? styles.containerMe : styles.containerOther,
			]}
		>
			{!message.me && (
				<Image source={{ uri: avatarUrl }} style={styles.avatar} />
			)}
			<View
				style={[
					styles.bubble,
					message.me ? styles.bubbleMe : styles.bubbleOther,
				]}
			>
				<Text style={styles.text}>{message.text}</Text>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		alignItems: "flex-end",
		marginVertical: 4,
	},
	containerMe: {
		justifyContent: "flex-end",
	},
	containerOther: {
		justifyContent: "flex-start",
	},
	avatar: {
		width: 30,
		height: 30,
		borderRadius: 15,
		marginRight: 10,
		marginBottom: 5,
	},
	bubble: {
		paddingVertical: 10,
		paddingHorizontal: 15,
		borderRadius: 25,
		elevation: 2,
		maxWidth: "75%",
	},
	bubbleMe: {
		backgroundColor: "#08bdbd",
		alignSelf: "flex-end",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		elevation: 5,
	},
	bubbleOther: {
		backgroundColor: "#FFFFFF",
		borderWidth: 1,
		borderColor: "#E0E0E0",
		alignSelf: "flex-start",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		elevation: 5,
	},
	text: {
		fontSize: 16,
	},
});

export default MessageItem;
