import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { DirectMessage } from "../../hooks/useDMControls";
import RoomLink from "./RoomLink";
import { colors } from "../../styles/colors";

interface MessageItemProps {
	message: DirectMessage;
}

const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
	const { messageBody, sender, room } = message.message;

	return (
		<View
			testID="message-container"
			style={[
				styles.container,
				message.messageSent ? styles.containerMe : styles.containerOther,
			]}
		>
			{!message.messageSent && sender.profile_picture_url && (
				<Image
					testID="profile-pic"
					source={{ uri: sender.profile_picture_url }}
					style={styles.avatar}
				/>
			)}
			<View
				style={[
					styles.bubble,
					message.messageSent ? styles.bubbleMe : styles.bubbleOther,
				]}
			>
				{room ? (
					<RoomLink room={room} />
				) : (
					<Text style={styles.text}>{messageBody}</Text>
				)}
			</View>
		</View>
	);
};

// Styles remain unchanged

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
		borderColor: "black",
		borderWidth: 1,
	},
	bubble: {
		paddingVertical: 10,
		paddingHorizontal: 15,
		borderRadius: 25,
		elevation: 2,
		maxWidth: "80%",
	},
	bubbleMe: {
		backgroundColor: colors.primary,
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
