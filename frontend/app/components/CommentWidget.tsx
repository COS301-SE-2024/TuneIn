import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";

interface CommentWidgetProps {
	username: string;
	message: string;
	profilePictureUrl: string;
	me?: boolean;
}

const CommentWidget: React.FC<CommentWidgetProps> = ({
	username,
	message,
	profilePictureUrl,
	me = false,
}) => {
	// Truncate the username if it's longer than 20 characters
	const truncatedUsername =
		username.length > 20 ? `${username.slice(0, 17)}...` : username;

	return (
		<View testID="comment-widget-container" style={[styles.container]}>
			<Image
				testID="comment-widget-avatar"
				source={
					profilePictureUrl
						? { uri: profilePictureUrl }
						: require("../../assets/imageholder.jpg")
				}
				style={styles.avatar}
			/>
			<View style={styles.messageContainer}>
				<Text style={styles.username}>{truncatedUsername}</Text>
				{/* Apply truncated username */}
				<View
					testID="comment-widget-bubble"
					style={[styles.bubble, me ? styles.bubbleMe : styles.bubbleOther]}
				>
					<Text style={styles.text}>{message}</Text>
				</View>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		alignItems: "flex-start", // Align the avatar and message at the top
		marginVertical: 4,
		marginRight: 10,
	},
	avatar: {
		width: 30,
		height: 30,
		borderRadius: 15,
		marginRight: 10,
	},
	messageContainer: {
		flex: 1, // Make the message container flexible to avoid forcing line breaks
	},
	bubble: {
		paddingVertical: 10,
		paddingHorizontal: 15,
		borderRadius: 25,
		elevation: 2,
		flexGrow: 1, // Allow the bubble to grow as needed
	},
	bubbleMe: {
		backgroundColor: "#08bdbd",
		alignSelf: "flex-start",
	},
	bubbleOther: {
		backgroundColor: "#FFFFFF",
		alignSelf: "flex-start",
		borderColor: "#ECECEC",
		borderWidth: 1,
	},
	text: {
		fontSize: 16,
		flexShrink: 1, // Allow the text to shrink and only wrap when necessary
	},
	username: {
		fontSize: 12,
		fontWeight: "bold",
		marginBottom: 5,
	},
});

export default CommentWidget;
