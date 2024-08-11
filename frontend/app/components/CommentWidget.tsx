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
	return (
		<View
			testID="comment-widget-container"
			style={[
				styles.container,
				me ? styles.containerMe : styles.containerOther,
			]}
		>
			<Image
				testID="comment-widget-avatar"
				source={{ uri: profilePictureUrl }}
				style={styles.avatar}
			/>
			<View>
				<Text style={styles.username}>{username}</Text>
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
		alignItems: "flex-end",
		marginVertical: 4,
	},
	containerMe: {
		justifyContent: "flex-start",
	},
	containerOther: {
		justifyContent: "flex-start",
	},
	avatar: {
		width: 30,
		height: 30,
		borderRadius: 15,
		marginRight: 10,
	},
	bubble: {
		paddingVertical: 10,
		paddingHorizontal: 15,
		borderRadius: 25,
		elevation: 2,
		maxWidth: "100%",
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
	},
	username: {
		fontSize: 12,
		fontWeight: "bold",
		marginBottom: 5,
	},
});

export default CommentWidget;
