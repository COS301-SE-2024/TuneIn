import React, { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { DirectMessage } from "../../services/Live";
import { colors } from "../../styles/colors";
import { Room } from "../../models/Room";
import RoomLink from "./RoomLink"; // Adjust the path as necessary
import axios from "axios";
import * as utils from "../../services/Utils";

interface MessageItemProps {
	message: DirectMessage;
}

const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
	const { messageBody, sender, room } = message.message;

	return (
		<View
			style={[
				styles.container,
				message.me ? styles.containerMe : styles.containerOther,
			]}
		>
			{!message.me && (
				<Image
					source={{ uri: sender.profile_picture_url }}
					style={styles.avatar}
				/>
			)}
			<View
				style={[
					styles.bubble,
					message.me ? styles.bubbleMe : styles.bubbleOther,
				]}
			>
				{room ? (
					<RoomLink room={room} /> // Render the RoomLink component if room is available
				) : (
					<Text style={styles.text}>{messageBody}</Text>
				)}
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
